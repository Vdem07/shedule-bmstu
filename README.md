
# 📘 Schedule BMSTU

Удобное мобильное приложение для просмотра расписания занятий студентов КФ МГТУ им. Н. Э. Баумана. Приложению достаточно один раз загрузить Excel-файл с расписанием, который выкладывают на официальном сайте КФ МГТУ им. Н.Э. Баумана — оно автоматически сохранит всё содержимое локально и запомнит выбранный курс и группу. При следующем запуске и использовании всё будет доступно без повторной загрузки.

## 🔧 Возможности

- 📂 Загрузка Excel-файла расписания (`.xlsx`)
- 📚 Выбор курса и группы (запоминается)
- 🗓️ Фильтрация по дню недели
- 💾 Автоматическое сохранение последнего выбора и расписания
- 📱 Современный, адаптивный интерфейс
- 📦 Локальное хранение данных через `AsyncStorage`

## 📋 Системные требования

- 📱 **Android**: версия **8.0 (Oreo)** или выше  
- 📁 Excel-файл расписания должен быть в формате `.xlsx`

## 🚀 Установка и запуск проекта

```bash
git clone https://github.com/yourusername/schedule-bmstu.git
cd schedule-bmstu
npm install
npx expo start
```

## 📥 Установка APK

Скачать последнюю версию приложения в виде `.apk` можно прямо из [раздела релизов](https://github.com/Vdem07/shedule-bmstu/releases) репозитория.

1. Перейти по ссылке: [Releases](https://github.com/Vdem07/shedule-bmstu/releases)
2. Выбрать последний релиз
3. Скачать файл с расширением `.apk`
4. Установить его на Android-устройство (может потребоваться включить установку из неизвестных источников)

> 🛠 Если требуется собрать APK самостоятельно:

```bash
npx expo install eas-cli
npx eas build --platform android --profile preview
```

> ⚠️ **Важно:** локальная сборка возможна только на **macOS** или **Linux**.

## 📁 Формат Excel-файла

Типовой формат расписания, которое составляет администрация КФ МГТУ:
- листы — это курсы
- Первая колонка — день недели
- Вторая колонка — время занятия
- Остальные колонки — названия групп
- Пары по числителю/знаменателю должны быть в одной ячейке, разделённой **переносом строки** (`Alt + Enter` в Excel)

## 📷 Скриншоты

![Screenshot_20250412_162547_Schedule BMSTU](https://github.com/user-attachments/assets/4e4087ee-9d43-4c08-b52c-1e8d0eee838b) ![Screenshot_20250412_162555_Schedule BMSTU](https://github.com/user-attachments/assets/9c423ff8-3ed6-4f57-9c17-ef4811de620f)
![Screenshot_20250412_162645_Schedule BMSTU](https://github.com/user-attachments/assets/d2a44585-3646-4110-acad-290685ce8343) ![Screenshot_20250412_162737_Schedule BMSTU](https://github.com/user-attachments/assets/04354445-28b8-4879-ad84-766242d4abf9)
![Screenshot_20250412_162746_Schedule BMSTU](https://github.com/user-attachments/assets/e7f055eb-e039-4642-94ee-3f048c37c20e)

## 🛠️ Используемые библиотеки

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [XLSX](https://www.npmjs.com/package/xlsx)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [@react-native-picker/picker](https://github.com/react-native-picker/picker)

## 📄 Лицензия

[MIT](LICENSE)
