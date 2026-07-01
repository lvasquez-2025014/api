#pragma once
#include <windows.h>
#include <bcrypt.h>
#include <winhttp.h>
#include <rpc.h>
#include <shellapi.h>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include <iostream>
#include <stdio.h>
#include <time.h>

#include "xorstr.hpp"

#pragma comment(lib, "bcrypt.lib")
#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "rpcrt4.lib")

namespace KeyAuth {

	class simple_json {
	public:
		static simple_json parse(const std::string& str) {
			simple_json j;
			j.raw = str;
			return j;
		}

		std::string operator[](const std::string& key) {
			std::string search1 = "\"" + key + "\"";
			size_t pos = raw.find(search1);
			if (pos == std::string::npos) return "";

			pos = raw.find(':', pos + search1.length());
			if (pos == std::string::npos) return "";
			pos++;

			// skip whitespace
			while (pos < raw.size() && (raw[pos] == ' ' || raw[pos] == '\t')) pos++;

			if (pos >= raw.size()) return "";

			if (raw[pos] == '"') {
				// string value
				pos++;
				size_t end = raw.find('"', pos);
				if (end == std::string::npos) return "";
				return raw.substr(pos, end - pos);
			}
			else if (raw[pos] == '{' || raw[pos] == '[') {
				// nested object/array - return raw
				int depth = 1;
				size_t start = pos;
				pos++;
				while (pos < raw.size() && depth > 0) {
					if (raw[pos] == '{' || raw[pos] == '[') depth++;
					else if (raw[pos] == '}' || raw[pos] == ']') depth--;
					pos++;
				}
				return raw.substr(start, pos - start);
			}
			else {
				// number, bool, null
				size_t end = raw.find_first_of(",}", pos);
				if (end == std::string::npos) end = raw.size();
				return raw.substr(pos, end - pos);
			}
		}

		bool has(const std::string& key) {
			return raw.find("\"" + key + "\"") != std::string::npos;
		}

		bool get_bool(const std::string& key) {
			std::string val = (*this)[key];
			return val == "true";
		}

	private:
		std::string raw;
	};

	// ─── AES-256-CBC + SHA-256 using Windows BCrypt ────────────────
	class encryption {
	public:
		std::string name;

		static std::string sha256(const std::string& plain_text) {
			BCRYPT_ALG_HANDLE alg;
			BCRYPT_HASH_HANDLE hash;

			BCryptOpenAlgorithmProvider(&alg, BCRYPT_SHA256_ALGORITHM, nullptr, 0);
			BCryptCreateHash(alg, &hash, nullptr, 0, nullptr, 0, 0);
			BCryptHashData(hash, (PUCHAR)plain_text.c_str(), (ULONG)plain_text.size(), 0);

			UCHAR hashBuf[32];
			BCryptFinishHash(hash, hashBuf, 32, 0);

			BCryptDestroyHash(hash);
			BCryptCloseAlgorithmProvider(alg, 0);

			return to_hex(hashBuf, 32);
		}

		static std::string encrypt_string(const std::string& plain_text, const std::string& key, const std::string& iv) {
			BCRYPT_ALG_HANDLE alg;
			BCRYPT_KEY_HANDLE hKey;
			BCryptOpenAlgorithmProvider(&alg, BCRYPT_AES_ALGORITHM, nullptr, 0);
			BCryptSetProperty(alg, BCRYPT_CHAINING_MODE, (PUCHAR)BCRYPT_CHAIN_MODE_CBC, sizeof(BCRYPT_CHAIN_MODE_CBC), 0);

			BCryptGenerateSymmetricKey(alg, &hKey, nullptr, 0, (PUCHAR)key.c_str(), (ULONG)key.size(), 0);

			ULONG cbData = 0;
			BCryptEncrypt(hKey, (PUCHAR)plain_text.c_str(), (ULONG)plain_text.size(), nullptr,
				(PUCHAR)iv.c_str(), (ULONG)iv.size(), nullptr, 0, &cbData, BCRYPT_BLOCK_PADDING);

			std::vector<UCHAR> cipherBuf(cbData);
			BCryptEncrypt(hKey, (PUCHAR)plain_text.c_str(), (ULONG)plain_text.size(), nullptr,
				(PUCHAR)iv.c_str(), (ULONG)iv.size(), cipherBuf.data(), cbData, &cbData, BCRYPT_BLOCK_PADDING);

			BCryptDestroyKey(hKey);
			BCryptCloseAlgorithmProvider(alg, 0);

			return to_hex_lower(cipherBuf.data(), cbData);
		}

		static std::string decrypt_string(const std::string& cipher_hex, const std::string& key, const std::string& iv) {
			std::vector<UCHAR> cipherBuf = from_hex(cipher_hex);

			BCRYPT_ALG_HANDLE alg;
			BCRYPT_KEY_HANDLE hKey;
			BCryptOpenAlgorithmProvider(&alg, BCRYPT_AES_ALGORITHM, nullptr, 0);
			BCryptSetProperty(alg, BCRYPT_CHAINING_MODE, (PUCHAR)BCRYPT_CHAIN_MODE_CBC, sizeof(BCRYPT_CHAIN_MODE_CBC), 0);

			BCryptGenerateSymmetricKey(alg, &hKey, nullptr, 0, (PUCHAR)key.c_str(), (ULONG)key.size(), 0);

			ULONG cbData = 0;
			BCryptDecrypt(hKey, cipherBuf.data(), (ULONG)cipherBuf.size(), nullptr,
				(PUCHAR)iv.c_str(), (ULONG)iv.size(), nullptr, 0, &cbData, BCRYPT_BLOCK_PADDING);

			std::vector<UCHAR> plainBuf(cbData);
			BCryptDecrypt(hKey, cipherBuf.data(), (ULONG)cipherBuf.size(), nullptr,
				(PUCHAR)iv.c_str(), (ULONG)iv.size(), plainBuf.data(), cbData, &cbData, BCRYPT_BLOCK_PADDING);

			BCryptDestroyKey(hKey);
			BCryptCloseAlgorithmProvider(alg, 0);

			return std::string((char*)plainBuf.data(), cbData);
		}

		static std::string encode(const std::string& plain_text) {
			return to_hex_lower((const UCHAR*)plain_text.c_str(), plain_text.size());
		}

		static std::string decode(const std::string& hex_text) {
			std::vector<UCHAR> buf = from_hex(hex_text);
			return std::string((char*)buf.data(), buf.size());
		}

		static std::string iv_key() {
			UUID uuid = { 0 };
			::UuidCreate(&uuid);
			RPC_CSTR szUuid = NULL;
			std::string guid;
			if (::UuidToStringA(&uuid, &szUuid) == RPC_S_OK) {
				guid = (char*)szUuid;
				::RpcStringFreeA(&szUuid);
			}
			return guid.substr(0, 16);
		}

		static std::string encrypt(std::string message, std::string enc_key, std::string iv) {
			enc_key = sha256(enc_key).substr(0, 32);
			iv = sha256(iv).substr(0, 16);
			return encrypt_string(message, enc_key, iv);
		}

		static std::string decrypt(std::string message, std::string enc_key, std::string iv) {
			enc_key = sha256(enc_key).substr(0, 32);
			iv = sha256(iv).substr(0, 16);
			return decrypt_string(message, enc_key, iv);
		}

	private:
		static std::string to_hex_lower(const UCHAR* data, size_t len) {
			std::string result;
			result.reserve(len * 2);
			const char* hex = "0123456789abcdef";
			for (size_t i = 0; i < len; i++) {
				result += hex[(data[i] >> 4) & 0xF];
				result += hex[data[i] & 0xF];
			}
			return result;
		}

		static std::string to_hex(const UCHAR* data, size_t len) {
			return to_hex_lower(data, len);
		}

		static std::vector<UCHAR> from_hex(const std::string& hex) {
			std::vector<UCHAR> result;
			result.reserve(hex.size() / 2);
			for (size_t i = 0; i < hex.size(); i += 2) {
				UCHAR byte = 0;
				for (int j = 0; j < 2; j++) {
					char c = hex[i + j];
					if (c >= '0' && c <= '9') byte = (byte << 4) | (c - '0');
					else if (c >= 'a' && c <= 'f') byte = (byte << 4) | (c - 'a' + 10);
					else if (c >= 'A' && c <= 'F') byte = (byte << 4) | (c - 'A' + 10);
				}
				result.push_back(byte);
			}
			return result;
		}
	};

	// ─── HWID using Windows SID (no ATL needed) ────────────────────
	class utils {
	public:
		static std::string get_hwid() {
			UCHAR sidBuffer[256];
			DWORD sidSize = sizeof(sidBuffer);
			char nameBuffer[256];
			DWORD nameSize = sizeof(nameBuffer);
			char domainBuffer[256];
			DWORD domainSize = sizeof(domainBuffer);
			SID_NAME_USE sidType;

			// Get current process token
			HANDLE hToken;
			if (!OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &hToken))
				return "unknown";

			// Get user SID
			if (!GetTokenInformation(hToken, TokenUser, sidBuffer, sidSize, &sidSize)) {
				CloseHandle(hToken);
				return "unknown";
			}
			CloseHandle(hToken);

			PTOKEN_USER pTokenUser = (PTOKEN_USER)sidBuffer;
			if (!LookupAccountSidA(nullptr, pTokenUser->User.Sid, nameBuffer, &nameSize, domainBuffer, &domainSize, &sidType))
				return "unknown";

			return std::string(domainBuffer) + "\\" + std::string(nameBuffer);
		}

		static std::time_t string_to_timet(std::string timestamp) {
			auto cv = strtol(timestamp.c_str(), NULL, 10);
			return (time_t)cv;
		}

		static std::tm timet_to_tm(time_t timestamp) {
			std::tm context;
			localtime_s(&context, &timestamp);
			return context;
		}
	};

	auto iv = encryption::sha256(encryption::iv_key());

	class api {
	public:
		std::string name, ownerid, secret, version;
		std::string last_error;

		api(std::string name, std::string ownerid, std::string secret, std::string version)
			: name(name), ownerid(ownerid), secret(secret), version(version) {}

		void init()
		{
			enckey = encryption::sha256(encryption::iv_key());
			if (ownerid.length() != 10 || secret.length() != 64)
			{
				std::cout << XorStr("\n\n Application Not Setup Correctly. Please Watch Video Linked in Main.cpp");
				Sleep(4500);
				return;
			}

			auto data =
				XorStr("type=").c_str() + encryption::encode(XorStr("init").c_str()) +
				XorStr("&ver=").c_str() + encryption::encrypt(version, secret, iv) +	
				XorStr("&enckey=").c_str() + encryption::encrypt(enckey, secret, iv) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;

			auto response = req(data);

			if (response.empty() || response == "null")
			{
				std::cout << XorStr("\n\n Could not connect to server.");
				return;
			}

			response = encryption::decrypt(response, secret, iv);
			auto json = simple_json::parse(response);

			if (json.get_bool("success"))
			{
				sessionid = json["success"]; // sessionid comes after success in JSON
				// Parse sessionid properly
				size_t sidPos = response.find("\"sessionid\"");
				if (sidPos != std::string::npos) {
					sidPos = response.find(':', sidPos);
					sidPos++;
					while (sidPos < response.size() && response[sidPos] == ' ') sidPos++;
					if (response[sidPos] == '"') {
						sidPos++;
						size_t end = response.find('"', sidPos);
						sessionid = response.substr(sidPos, end - sidPos);
					}
				}
			}
			else if (json.has("message") && json["message"] == XorStr("invalidver"))
			{
				std::string dl = json["download"];
				ShellExecuteA(0, XorStr("open"), dl.c_str(), 0, 0, SW_SHOWNORMAL);
				return;
			}
			else
			{
				std::cout << "\n\n ";
				std::cout << json["message"];
				Sleep(4500);
				return;
			}
		}

		bool login(std::string username, std::string password)
		{
			std::string hwid = utils::get_hwid();
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode("login") +
				XorStr("&username=").c_str() + encryption::encrypt(username, enckey, iv) +
				XorStr("&pass=").c_str() + encryption::encrypt(password, enckey, iv) +
				XorStr("&hwid=").c_str() + encryption::encrypt(hwid, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			if (response.empty() || response == "null") { last_error = "Could not connect to server"; return false; }
			try {
				response = encryption::decrypt(response, enckey, iv);
				auto json = simple_json::parse(response);

				if (json.get_bool("success"))
				{
					load_user_data(response);
					last_error.clear();
					return true;
				}
				else
				{
					last_error = json.has("message") ? json["message"] : "Invalid credentials";
					return false;
				}
			} catch (...) {
				last_error = "Invalid server response";
				return false;
			}
		}

		bool regstr(std::string username, std::string password, std::string key) {
			std::string hwid = utils::get_hwid();
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode("register") +
				XorStr("&username=").c_str() + encryption::encrypt(username, enckey, iv) +
				XorStr("&pass=").c_str() + encryption::encrypt(password, enckey, iv) +
				XorStr("&key=").c_str() + encryption::encrypt(key, enckey, iv) +
				XorStr("&hwid=").c_str() + encryption::encrypt(hwid, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			if (response.empty() || response == "null") { last_error = "Could not connect to server"; return false; }
			try {
				response = encryption::decrypt(response, enckey, iv);
				auto json = simple_json::parse(response);

				if (json.get_bool("success"))
				{
					load_user_data(response);
					last_error.clear();
					return true;
				}
				else
				{
					last_error = json.has("message") ? json["message"] : "Registration failed";
					return false;
				}
			} catch (...) {
				last_error = "Invalid server response";
				return false;
			}
		}

		void upgrade(std::string username, std::string key) {
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode("upgrade") +
				XorStr("&username=").c_str() + encryption::encrypt(username, enckey, iv) +
				XorStr("&key=").c_str() + encryption::encrypt(key, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			if (response.empty() || response == "null") return;
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (!json.get_bool("success")) {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
				Sleep(3500);
				return;
			}
		}

		void license(std::string key) {
			auto iv = encryption::sha256(encryption::iv_key());
			std::string hwid = utils::get_hwid();
			auto data =
				XorStr("type=").c_str() + encryption::encode("license") +
				XorStr("&key=").c_str() + encryption::encrypt(key, enckey, iv) +
				XorStr("&hwid=").c_str() + encryption::encrypt(hwid, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			if (response.empty() || response == "null") return;
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (json.get_bool("success")) {
				load_user_data(response);
			}
			else {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
				Sleep(3500);
				return;
			}
		}

		void ban() {
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode("ban") +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			if (response.empty() || response == "null") return;
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (!json.get_bool("success")) {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
				Sleep(3500);
				return;
			}
		}

		std::string var(std::string varid) {
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode("var") +
				XorStr("&varid=").c_str() + encryption::encrypt(varid, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;
			auto response = req(data);
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (json.get_bool("success")) {
				return json["message"];
			}
			else {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
				return "";
			}
		}

		void log(std::string message) {
			auto iv = encryption::sha256(encryption::iv_key());
			char acUserName[100];
			DWORD nUserName = sizeof(acUserName);
			GetUserNameA(acUserName, &nUserName);
			std::string UsernamePC = acUserName;

			auto data =
				XorStr("type=").c_str() + encryption::encode(XorStr("log").c_str()) +
				XorStr("&pcuser=").c_str() + encryption::encrypt(UsernamePC, enckey, iv) +
				XorStr("&message=").c_str() + encryption::encrypt(message, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;

			req(data);
		}

		std::vector<unsigned char> download(std::string fileid) {
			auto iv = encryption::sha256(encryption::iv_key());
			auto to_uc_vector = [](std::string value) {
				return std::vector<unsigned char>(value.data(), value.data() + value.length() + 1);
			};

			auto data =
				XorStr("type=").c_str() + encryption::encode("file") +
				XorStr("&fileid=").c_str() + encryption::encrypt(fileid, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;

			auto response = req(data);
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (!json.get_bool("success")) {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
			}

			auto file = encryption::decode(json["contents"]);
			return to_uc_vector(file);
		}

		void webhook(std::string id, std::string params) {
			auto iv = encryption::sha256(encryption::iv_key());
			auto data =
				XorStr("type=").c_str() + encryption::encode(XorStr("webhook").c_str()) +
				XorStr("&webid=").c_str() + encryption::encrypt(id, enckey, iv) +
				XorStr("&params=").c_str() + encryption::encrypt(params, enckey, iv) +
				XorStr("&sessionid=").c_str() + encryption::encode(sessionid) +
				XorStr("&name=").c_str() + encryption::encode(name) +
				XorStr("&ownerid=").c_str() + encryption::encode(ownerid) +
				XorStr("&init_iv=").c_str() + iv;

			auto response = req(data);
			response = encryption::decrypt(response, enckey, iv);
			auto json = simple_json::parse(response);

			if (!json.get_bool("success")) {
				std::cout << XorStr("\n\n Status: Failure: ");
				std::cout << json["message"];
			}
		}

		class user_data_class {
		public:
			std::string username;
			std::tm expiry;
			std::string subscription;
		};

		user_data_class user_data;

	private:
		std::string sessionid, enckey;

		// HTTP POST using WinHTTP (no libcurl needed)
		static std::string req(std::string data) {
			HINTERNET hSession = WinHttpOpen(XorStr(L"KeyAuth/1.0").c_str(),
				WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
				WINHTTP_NO_PROXY_NAME,
				WINHTTP_NO_PROXY_BYPASS, 0);
			if (!hSession) return "null";

			HINTERNET hConnect = WinHttpConnect(hSession, XorStr(L"oficial-auth-backend.onrender.com"), 443, 0);
			if (!hConnect) { WinHttpCloseHandle(hSession); return "null"; }

			HINTERNET hRequest = WinHttpOpenRequest(hConnect, XorStr(L"POST").c_str(), XorStr(L"/api/1.0").c_str(),
				nullptr, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, WINHTTP_FLAG_SECURE);
			if (!hRequest) { WinHttpCloseHandle(hConnect); WinHttpCloseHandle(hSession); return "null"; }

			const wchar_t* headers = XorStr(L"Content-Type: application/x-www-form-urlencoded").c_str();
			BOOL sent = WinHttpSendRequest(hRequest, headers, (DWORD)wcslen(headers),
				(LPVOID)data.c_str(), (DWORD)data.size(), (DWORD)data.size(), 0);

			if (!sent) {
				WinHttpCloseHandle(hRequest);
				WinHttpCloseHandle(hConnect);
				WinHttpCloseHandle(hSession);
				return "null";
			}

			WinHttpReceiveResponse(hRequest, nullptr);

			std::string result;
			DWORD bytesAvailable = 0;
			while (WinHttpQueryDataAvailable(hRequest, &bytesAvailable) && bytesAvailable > 0) {
				std::vector<char> buffer(bytesAvailable + 1, 0);
				DWORD bytesRead = 0;
				WinHttpReadData(hRequest, buffer.data(), bytesAvailable, &bytesRead);
				result.append(buffer.data(), bytesRead);
			}

			WinHttpCloseHandle(hRequest);
			WinHttpCloseHandle(hConnect);
			WinHttpCloseHandle(hSession);

			return result;
		}

		// Extract "username" and "subscriptions" from raw JSON
		void load_user_data(const std::string& rawJson) {
			simple_json json = simple_json::parse(rawJson);

			// Extract from info object
			size_t infoPos = rawJson.find("\"info\"");
			if (infoPos != std::string::npos) {
				std::string infoStr = rawJson.substr(infoPos);
				simple_json info = simple_json::parse(infoStr);
				user_data.username = info["username"];

				// Extract subscription info
				size_t subPos = infoStr.find("\"subscriptions\"");
				if (subPos != std::string::npos) {
					std::string subStr = infoStr.substr(subPos);
					size_t expiryPos = subStr.find("\"expiry\"");
					if (expiryPos != std::string::npos) {
						size_t valStart = subStr.find(':', expiryPos) + 1;
						while (valStart < subStr.size() && subStr[valStart] == ' ') valStart++;
						size_t valEnd = subStr.find_first_of(",}", valStart);
						if (valEnd == std::string::npos) valEnd = subStr.size();
						std::string expiryStr = subStr.substr(valStart, valEnd - valStart);
						// Remove quotes if present
						if (expiryStr.front() == '"') expiryStr = expiryStr.substr(1, expiryStr.size() - 2);
						user_data.expiry = utils::timet_to_tm(utils::string_to_timet(expiryStr));
					}

					size_t subNamePos = subStr.find("\"subscription\"");
					if (subNamePos != std::string::npos) {
						size_t valStart = subStr.find(':', subNamePos) + 1;
						while (valStart < subStr.size() && subStr[valStart] == ' ') valStart++;
						if (subStr[valStart] == '"') {
							valStart++;
							size_t valEnd = subStr.find('"', valStart);
							user_data.subscription = subStr.substr(valStart, valEnd - valStart);
						}
					}
				}
			}
		}
	};
}
