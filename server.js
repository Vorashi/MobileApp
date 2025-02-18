const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const baseFolder = 'D:/practicSharov/fsApp/dataFile';

if (!fs.existsSync(baseFolder)) {
  console.error('Папка не существует:', baseFolder);
  process.exit(1); 
}

app.get('/files', (req, res) => {
  fs.readdir(baseFolder, (err, files) => {
    if (err) {
      console.error('Ошибка чтения папки:', err);
      return res.status(500).send('Ошибка чтения папки');
    }
    
    const fileList = files.filter(file => {
      return fs.statSync(path.join(baseFolder, file)).isFile();
    });
    
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