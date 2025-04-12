import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, ScrollView, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

interface ScheduleConfig {
  sheet: string;
  group: string;
}

interface ScheduleJSON {
  [sheet: string]: string[][];
}

interface Lesson {
  time: string;
  text: string;
}

interface DaySchedule {
  day: string;
  lessons: Lesson[];
}

export default function App() {
  const [scheduleData, setScheduleData] = useState<ScheduleJSON | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [structuredSchedule, setStructuredSchedule] = useState<DaySchedule[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Все дни');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (selectedSheet && scheduleData) {
      const headers = scheduleData[selectedSheet][0];
      const groupList = headers.slice(2).filter((col) => typeof col === 'string' && col.trim() !== '');
      setGroups(groupList);
    }
  }, [selectedSheet, scheduleData]);

  useEffect(() => {
    if (selectedGroup && selectedSheet) {
      displaySchedule();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedDay === 'Все дни') {
      setFilteredSchedule(structuredSchedule);
    } else {
      setFilteredSchedule(structuredSchedule.filter(d => d.day === selectedDay));
    }
  }, [selectedDay, structuredSchedule]);

  const loadFromStorage = async () => {
    const raw = await AsyncStorage.getItem('scheduleData');
    const config = await AsyncStorage.getItem('scheduleConfig');
    if (raw) {
      const parsed: ScheduleJSON = JSON.parse(raw);
      setScheduleData(parsed);
      setSheetNames(Object.keys(parsed));
    }
    if (config) {
      const cfg: ScheduleConfig = JSON.parse(config);
      setSelectedSheet(cfg.sheet);
      setSelectedGroup(cfg.group);
    }
  };

  const saveToStorage = async (data: ScheduleJSON, cfg?: ScheduleConfig) => {
    await AsyncStorage.setItem('scheduleData', JSON.stringify(data));
    if (cfg) {
      await AsyncStorage.setItem('scheduleConfig', JSON.stringify(cfg));
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      copyToCacheDirectory: true
    });

    if (result.assets && result.assets.length > 0) {
      try {
        setIsLoading(true);
        const uri = result.assets[0].uri;
        const file = await fetch(uri);
        const blob = await file.blob();

        const reader = new FileReader();

        reader.onload = async (e) => {
          if (!e.target?.result) return;

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });

          const jsonData: ScheduleJSON = {};
          wb.SheetNames.forEach((name) => {
            const ws = wb.Sheets[name];
            const sheetData = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              defval: ''
            }) as string[][];
            jsonData[name] = sheetData;
          });

          setScheduleData(jsonData);
          setSheetNames(Object.keys(jsonData));
          setSelectedSheet('');
          setSelectedGroup('');
          setStructuredSchedule([]);
          await saveToStorage(jsonData);
          setIsLoading(false);
        };

        reader.onerror = () => {
          setIsLoading(false);
          Alert.alert('Ошибка чтения файла');
        };

        reader.readAsArrayBuffer(blob);
      } catch (err) {
        setIsLoading(false);
        Alert.alert('Ошибка', 'Не удалось прочитать файл');
      }
    }
  };

  const displaySchedule = async () => {
    if (!scheduleData || !selectedSheet || !selectedGroup) return;

    const data = scheduleData[selectedSheet];
    const headers = data[0];
    const groupIndex = headers.indexOf(selectedGroup);

    if (groupIndex === -1) return;

    const trimmedData = data.slice(1).filter((row, index) => {
      const isGroupNameRow = row[groupIndex]?.toString().trim() === selectedGroup;
      return !isGroupNameRow;
    });

    const days: DaySchedule[] = [];
    let currentDay = '';
    let currentTime = '';

    for (let i = 0; i < trimmedData.length; i++) {
      const row = trimmedData[i];
      const day = row[0]?.trim() || '';
      const time = row[1]?.trim() || '';
      const raw = row[groupIndex]?.toString() ?? '';
      const lessonText = raw.replace(/\r\n|\r/g, '\n').trim();

      if (day) currentDay = day;
      if (time) currentTime = time;

      if (!lessonText && !time) continue;

      let dayBlock = days.find((d) => d.day === currentDay);
      if (!dayBlock) {
        dayBlock = { day: currentDay, lessons: [] };
        days.push(dayBlock);
      }

      const prevLesson = dayBlock.lessons.at(-1);
      if (!time && lessonText && prevLesson) {
        prevLesson.text += `\n${lessonText}`;
      } else {
        dayBlock.lessons.push({ time: currentTime, text: lessonText });
      }
    }

    setStructuredSchedule(days);
    setSelectedDay('Все дни');
    await saveToStorage(scheduleData, { sheet: selectedSheet, group: selectedGroup });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.buttonWrapper}>
        <Button title="📂 Загрузить Excel" onPress={pickFile} />
      </View>

      {sheetNames.length > 0 && (
        <View style={styles.toggleWrapper}>
          <Button
            title={isCollapsed ? '🔽 Показать выбор группы' : '🔼 Скрыть выбор группы'}
            onPress={() => setIsCollapsed(!isCollapsed)}
            color="#007AFF"
          />
        </View>
      )}

      {!isLoading && sheetNames.length > 0 && !isCollapsed && (
        <View style={styles.card}>
          <Text style={styles.label}>Выберите курс:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedSheet}
              onValueChange={setSelectedSheet}
              style={styles.picker}
            >
              <Picker.Item label="Выберите курс" value="" />
              {sheetNames.map((sheet) => (
                <Picker.Item label={sheet} value={sheet} key={sheet} />
              ))}
            </Picker>
          </View>

          {groups.length > 0 && (
            <>
              <Text style={styles.label}>Выберите группу:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedGroup}
                  onValueChange={setSelectedGroup}
                  style={styles.picker}
                >
                  <Picker.Item label="Выберите группу" value="" />
                  {groups.map((group, index) => (
                    <Picker.Item label={group} value={group} key={index} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Фильтр по дню:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedDay}
                  onValueChange={setSelectedDay}
                  style={styles.picker}
                >
                  <Picker.Item label="Все дни" value="Все дни" />
                  {structuredSchedule.map((day, index) => (
                    <Picker.Item label={day.day} value={day.day} key={index} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>
      )}

      {isLoading && (
        <View style={styles.loaderContainer}>
          <Text style={styles.loaderText}>Загрузка...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <ScrollView style={styles.scroll}>
        {filteredSchedule.map(({ day, lessons }, index) => (
          <View key={index} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>📅 {day}</Text>
            {lessons.map((lesson, idx) => (
              <View key={idx} style={styles.lessonBlock}>
                <Text style={styles.lessonTime}>⏰ {lesson.time}</Text>
                {lesson.text.split('\n').filter(Boolean).map((line, i, arr) => (
                  <React.Fragment key={i}>
                    <Text style={styles.lessonText}>📘 {line}</Text>
                    {i < arr.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 40, backgroundColor: '#f9f9f9' },
  buttonWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  toggleWrapper: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4, marginBottom: 20
  },
  pickerWrapper: {
    backgroundColor: '#f0f0f0', borderRadius: 12, overflow: 'hidden',
    marginVertical: 8, borderWidth: 1, borderColor: '#ddd'
  },
  picker: { height: 55, paddingHorizontal: 10, color: '#333' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 10, marginBottom: 4 },
  scroll: { flex: 1 },
  loaderContainer: { marginVertical: 20, alignItems: 'center' },
  loaderText: { marginBottom: 10, fontSize: 16 },
  dayBlock: {
    marginBottom: 20, backgroundColor: '#f0f4ff', borderRadius: 16, padding: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3, elevation: 1
  },
  dayTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#2a2a2a' },
  lessonBlock: {
    backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2, elevation: 1
  },
  lessonTime: { fontSize: 14, color: '#555', marginBottom: 4 },
  lessonText: { fontSize: 15, color: '#222' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 6 }
});
