import 'package:flutter/material.dart';

class Category {
  final String id;
  final String name;
  final String icon;
  final Color color;
  final bool isCustom;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    this.isCustom = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color.value,
      'isCustom': isCustom,
    };
  }

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      icon: json['icon'],
      color: Color(json['color']),
      isCustom: json['isCustom'] ?? false,
    );
  }
}

class CategoryService {
  static List<Category> getDefaultCategories() {
    return [
      Category(
        id: 'shopping',
        name: 'Shopping',
        icon: '🛍️',
        color: const Color(0xFFFF6B6B),
      ),
      Category(
        id: 'food',
        name: 'Alimentation',
        icon: '☕',
        color: const Color(0xFF4ECDC4),
      ),
      Category(
        id: 'transport',
        name: 'Transport',
        icon: '🚗',
        color: const Color(0xFF45B7D1),
      ),
      Category(
        id: 'entertainment',
        name: 'Loisirs',
        icon: '🎮',
        color: const Color(0xFF96CEB4),
      ),
      Category(
        id: 'health',
        name: 'Santé',
        icon: '❤️',
        color: const Color(0xFFFF7F50),
      ),
      Category(
        id: 'home',
        name: 'Maison',
        icon: '🏠',
        color: const Color(0xFF9B59B6),
      ),
    ];
  }
}