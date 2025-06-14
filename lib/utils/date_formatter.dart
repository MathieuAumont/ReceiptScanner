import 'package:intl/intl.dart';

class DateFormatter {
  static final DateFormat _formatter = DateFormat('MMM d, yyyy');

  static String format(DateTime date) {
    return _formatter.format(date);
  }

  static String formatShort(DateTime date) {
    return DateFormat('MMM d').format(date);
  }

  static String formatLong(DateTime date) {
    return DateFormat('EEEE, MMMM d, yyyy').format(date);
  }
}