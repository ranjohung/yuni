import 'package:flutter/material.dart';

class DigitalHumanWidget extends StatelessWidget {
  final String name;
  final String coreType;
  final String emotion;
  final double size;

  const DigitalHumanWidget({
    super.key,
    required this.name,
    required this.coreType,
    this.emotion = 'neutral',
    this.size = 200,
  });

  String get _emotionEmoji {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'surprised': return '😮';
      case 'worried': return '😟';
      case 'comforting': return '🥰';
      default: return '😌';
    }
  }

  String get _typeEmoji {
    switch (coreType) {
      case 'pursuer': return '🔍';
      case 'guardian': return '🛡️';
      case 'wanderer': return '🌊';
      case 'healer': return '💚';
      default: return '✨';
    }
  }

  Color _typeColor(ThemeData theme) {
    switch (coreType) {
      case 'pursuer': return Colors.orange;
      case 'guardian': return Colors.blue;
      case 'wanderer': return Colors.teal;
      case 'healer': return Colors.green;
      default: return Colors.purple;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _typeColor(theme);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 数字人形象
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [color.withValues(alpha: 0.3), color.withValues(alpha: 0.1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            border: Border.all(color: color.withValues(alpha: 0.3), width: 2),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.15),
                blurRadius: 20,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // 背景光晕
              Container(
                width: size * 0.7,
                height: size * 0.7,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withValues(alpha: 0.08),
                ),
              ),
              // 类型图标
              Text(_typeEmoji, style: TextStyle(fontSize: size * 0.35)),
              // 情绪表情 - 浮动在右下角
              Positioned(
                right: size * 0.05,
                bottom: size * 0.08,
                child: Container(
                  padding: EdgeInsets.all(size * 0.04),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)],
                  ),
                  child: Text(_emotionEmoji, style: TextStyle(fontSize: size * 0.12)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // 名字
        Text(name, style: TextStyle(
          fontSize: size * 0.12,
          fontWeight: FontWeight.w600,
          color: color,
        )),
        const SizedBox(height: 4),
        // 类型标签
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 3),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(_typeName, style: TextStyle(fontSize: 12, color: color)),
        ),
      ],
    );
  }

  String get _typeName {
    switch (coreType) {
      case 'pursuer': return '追寻者';
      case 'guardian': return '守护者';
      case 'wanderer': return '流浪者';
      case 'healer': return '疗愈者';
      default: return '未知';
    }
  }
}
