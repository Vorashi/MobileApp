import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const App = () => {
  const [folderPath, setFolderPath] = useState('');
  const [files, setFiles] = useState([]);
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');

  const setBaseFolder = async () => {
    try {
      await axios.post(`${API_URL}/set-folder`, { folderPath });
      Alert.alert('Успех', 'Базовая папка установлена');
      fetchFiles();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось установить базовую папку');
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      setFiles(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить список файлов');
    }
  };

  const createFile = async () => {
    try {
      await axios.post(`${API_URL}/files`, { filename, content });
      fetchFiles();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать файл');
    }
  };

  const deleteFile = async (filename) => {
    try {
      await axios.delete(`${API_URL}/file/${filename}`);
      fetchFiles();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить файл');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Путь к папке"
        value={folderPath}
        onChangeText={setFolderPath}
      />
      <Button title="Установить папку" onPress={setBaseFolder} />

      <TextInput
        style={styles.input}
        placeholder="Имя файла"
        value={filename}
        onChangeText={setFilename}
      />
      <TextInput
        style={styles.input}
        placeholder="Содержимое файла"
        value={content}
        onChangeText={setContent}
      />
      <Button title="Создать файл" onPress={createFile} />

      <FlatList
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text>{item}</Text>
            <Button title="Удалить" onPress={() => deleteFile(item)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default App;