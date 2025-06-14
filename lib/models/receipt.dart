class Receipt {
  final String id;
  final String company;
  final DateTime date;
  final List<ReceiptItem> items;
  final double subtotal;
  final Taxes taxes;
  final double totalAmount;
  final String category;
  final String currency;
  final String? notes;
  final String? originalImage;
  final ReceiptMetadata? metadata;

  Receipt({
    required this.id,
    required this.company,
    required this.date,
    required this.items,
    required this.subtotal,
    required this.taxes,
    required this.totalAmount,
    required this.category,
    this.currency = 'CAD',
    this.notes,
    this.originalImage,
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'company': company,
      'date': date.toIso8601String(),
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'taxes': taxes.toJson(),
      'totalAmount': totalAmount,
      'category': category,
      'currency': currency,
      'notes': notes,
      'originalImage': originalImage,
      'metadata': metadata?.toJson(),
    };
  }

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      id: json['id'],
      company: json['company'],
      date: DateTime.parse(json['date']),
      items: (json['items'] as List)
          .map((item) => ReceiptItem.fromJson(item))
          .toList(),
      subtotal: json['subtotal'].toDouble(),
      taxes: Taxes.fromJson(json['taxes']),
      totalAmount: json['totalAmount'].toDouble(),
      category: json['category'],
      currency: json['currency'] ?? 'CAD',
      notes: json['notes'],
      originalImage: json['originalImage'],
      metadata: json['metadata'] != null
          ? ReceiptMetadata.fromJson(json['metadata'])
          : null,
    );
  }
}

class ReceiptItem {
  final String id;
  final String name;
  final double price;
  final int quantity;

  ReceiptItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'quantity': quantity,
    };
  }

  factory ReceiptItem.fromJson(Map<String, dynamic> json) {
    return ReceiptItem(
      id: json['id'],
      name: json['name'],
      price: json['price'].toDouble(),
      quantity: json['quantity'],
    );
  }
}

class Taxes {
  final double tps;
  final double tvq;

  Taxes({
    required this.tps,
    required this.tvq,
  });

  Map<String, dynamic> toJson() {
    return {
      'tps': tps,
      'tvq': tvq,
    };
  }

  factory Taxes.fromJson(Map<String, dynamic> json) {
    return Taxes(
      tps: json['tps'].toDouble(),
      tvq: json['tvq'].toDouble(),
    );
  }
}

class ReceiptMetadata {
  final DateTime processedAt;
  final String ocrEngine;
  final String version;
  final double confidence;
  final String? originalText;

  ReceiptMetadata({
    required this.processedAt,
    required this.ocrEngine,
    required this.version,
    required this.confidence,
    this.originalText,
  });

  Map<String, dynamic> toJson() {
    return {
      'processedAt': processedAt.toIso8601String(),
      'ocrEngine': ocrEngine,
      'version': version,
      'confidence': confidence,
      'originalText': originalText,
    };
  }

  factory ReceiptMetadata.fromJson(Map<String, dynamic> json) {
    return ReceiptMetadata(
      processedAt: DateTime.parse(json['processedAt']),
      ocrEngine: json['ocrEngine'],
      version: json['version'],
      confidence: json['confidence'].toDouble(),
      originalText: json['originalText'],
    );
  }
}