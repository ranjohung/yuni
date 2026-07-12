import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static const String androidBaseUrl = 'http://10.0.2.2:3000/api/v1'; // Android模拟器
  static const String iosBaseUrl = 'http://localhost:3000/api/v1';
  static const String webBaseUrl = 'http://localhost:3000/api/v1';
  static const String productionBaseUrl = 'https://api.yuni.app/api/v1';

  String? _token;
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  String get base {
    if (kReleaseMode) {
      return productionBaseUrl;
    }
    if (kIsWeb) {
      return webBaseUrl;
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return androidBaseUrl;
    }
    return iosBaseUrl;
  }

  bool get hasToken => _token != null && _token!.isNotEmpty;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // GET
  Future<Map<String, dynamic>> get(String path, {Map<String, String>? query}) async {
    final uri = Uri.parse('$base$path').replace(queryParameters: query);
    final response = await http.get(uri, headers: _headers);
    return _handleResponse(response);
  }

  // POST
  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$base$path');
    final response = await http.post(uri, headers: _headers, body: jsonEncode(body));
    return _handleResponse(response);
  }

  // PUT
  Future<Map<String, dynamic>> put(String path, {Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$base$path');
    final response = await http.put(uri, headers: _headers, body: jsonEncode(body));
    return _handleResponse(response);
  }

  // DELETE
  Future<Map<String, dynamic>> delete(String path) async {
    final uri = Uri.parse('$base$path');
    final response = await http.delete(uri, headers: _headers);
    return _handleResponse(response);
  }

  // SSE流式对话
  Stream<Map<String, dynamic>> chatStream(int partnerId, String message) async* {
    final uri = Uri.parse('$base/chat/stream/$partnerId').replace(queryParameters: {'message': message});
    final request = http.Request('GET', uri);
    request.headers.addAll(_headers);

    final response = await http.Client().send(request);
    
    await for (final chunk in response.stream.transform(utf8.decoder)) {
      for (final line in chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          final data = line.substring(6);
          if (data.isNotEmpty) {
            yield jsonDecode(data) as Map<String, dynamic>;
          }
        }
      }
    }
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    throw ApiException(response.statusCode, body['error'] ?? '未知错误');
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
  @override
  String toString() => 'ApiException($statusCode): $message';
}
