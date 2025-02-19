const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

let baseFolder = '';

app.post('/set-folder', (req, res) => {
  const { folderPath } = req.body;

  if (!fs.existsSync(folderPath)) {
    return res.status(400).send('Папка не существует');
  }

  baseFolder = folderPath;
  res.send('Базовая папка установлена');
});

async function logAction(userId, actionType, filePath, additionalData = null) {
  const query = {
    text: 'INSERT INTO user_actions(user_id, action_type, file_path, additional_data) VALUES($1, $2, $3, $4)',
    values: [userId, actionType, filePath, additionalData],
  };

  try {
    await client.query(query);
    console.log('Действие записано в лог');
  } catch (err) {
    console.error('Ошибка записи в лог:', err);
  }
}

app.get('/files', (req, res) => {
  if (!baseFolder) {
    return res.status(400).send('Базовая папка не установлена');
  }

  fs.readdir(baseFolder, (err, files) => {
    if (err) {
      console.error('Ошибка чтения папки:', err);
      return res.status(500).send('Ошибка чтения папки');
    }

    const fileList = files.filter(file => fs.statSync(path.join(baseFolder, file)).isFile());
    res.json(fileList);
  });
});

app.post('/files', (req, res) => {
  const { filename, content } = req.body;
  const filePath = path.join(baseFolder, filename);

  if (fs.existsSync(filePath)) {
    return res.status(400).send('Файл уже существует');
  }

  fs.writeFile(filePath, content || '', (err) => {
    if (err) {
      console.error('Ошибка создания файла:', err);
      return res.status(500).send('Ошибка создания файла');
    }
    res.send('Файл создан');
  });
});

app.get('/file/:filename', (req, res) => {
  const filePath = path.join(baseFolder, req.params.filename);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return res.status(404).send('Файл не найден');
    }
    res.json({ content: data });
  });
});

app.put('/file/:filename', (req, res) => {
  const filePath = path.join(baseFolder, req.params.filename);
  const content = req.body.content;

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Ошибка сохранения:', err);
      return res.status(500).send('Ошибка сохранения');
    }
    res.send('Файл обновлен');
  });
});

app.delete('/file/:filename', (req, res) => {
  const filePath = path.join(baseFolder, req.params.filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Ошибка удаления:', err);
      return res.status(500).send('Ошибка удаления');
    }
    res.send('Файл удален');
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту http://localhost:${port}`);
});