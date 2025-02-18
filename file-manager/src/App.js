import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [content, setContent] = useState('');
  const [newFilename, setNewFilename] = useState('');

  const loadFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Ошибка загрузки файлов:', err);
      alert('Ошибка загрузки файлов');
    }
  };

  const createFile = async () => {
    if (!newFilename) return;
    try {
      await axios.post('http://localhost:5000/files', {
        filename: newFilename,
        content: ''
      });
      setNewFilename('');
      loadFiles();
    } catch (err) {
      alert(err.response?.data || 'Ошибка создания');
    }
  };

  const loadFileContent = async (filename) => {
    try {
      const res = await axios.get(`http://localhost:5000/file/${filename}`);
      setSelectedFile(filename);
      setContent(res.data.content);
    } catch (err) {
      alert('Ошибка загрузки содержимого');
    }
  };

  const saveFile = async () => {
    try {
      await axios.put(`http://localhost:5000/file/${selectedFile}`, {
        content
      });
      alert('Файл сохранен');
    } catch (err) {
      alert('Ошибка сохранения');
    }
  };

  const deleteFile = async () => {
    try {
      await axios.delete(`http://localhost:5000/file/${selectedFile}`);
      setSelectedFile('');
      setContent('');
      loadFiles();
      alert('Файл удален');
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ width: '200px' }}>
        <h2>Файлы</h2>
        <div>
          <input
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="Новый файл..."
          />
          <button onClick={createFile}>Создать</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {files.map((file) => (
            <li
              key={file}
              onClick={() => loadFileContent(file)}
              style={{
                cursor: 'pointer',
                padding: '5px',
                background: selectedFile === file ? '#eee' : 'transparent'
              }}
            >
              {file}
            </li>
          ))}
        </ul>
      </div>
      {selectedFile && (
        <div style={{ flex: 1 }}>
          <h2>Редактирование: {selectedFile}</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', height: '300px', padding: '10px' }}
          />
          <div style={{ marginTop: '10px' }}>
            <button onClick={saveFile} style={{ marginRight: '10px' }}>
              Сохранить
            </button>
            <button onClick={deleteFile} style={{ background: '#ff4444' }}>
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;