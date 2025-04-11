// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中介層設定
app.use(cors());
app.use(express.json());

// 中間件：驗證請求參數
const validateJiraParams = (req, res, next) => {
  const { domain, email, apiToken } = req.query;

  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: '缺少必要參數' });
  }

  // 將參數添加到請求對象中
  req.jiraAuth = {
    domain: domain.replace(/^https?:\/\//, ''),
    headers: {
      'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
      'Accept': 'application/json'
    }
  };

  next();
};

// 獲取用戶資訊
app.get('/api/jira/myself', validateJiraParams, async (req, res) => {
  const { domain, headers } = req.jiraAuth;

  try {
    const response = await fetch(`https://${domain}/rest/api/2/myself`, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jira API 錯誤' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取項目列表
app.get('/api/jira/projects', validateJiraParams, async (req, res) => {
  const { domain, headers } = req.jiraAuth;

  try {
    const response = await fetch(`https://${domain}/rest/api/2/project`, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jira API 錯誤' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 搜尋 Jira 問題
app.get('/api/jira/search', validateJiraParams, async (req, res) => {
  const { domain, headers } = req.jiraAuth;
  const { jql, maxResults = 50 } = req.query;

  try {
    const url = `https://${domain}/rest/api/2/search?jql=${encodeURIComponent(jql || 'assignee = currentUser()')}&maxResults=${maxResults}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jira API 錯誤' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 獲取問題詳情
app.get('/api/jira/issue/:key', validateJiraParams, async (req, res) => {
  const { domain, headers } = req.jiraAuth;
  const { key } = req.params;
  const { fields } = req.query;

  try {
    const fieldsParam = fields ? `?fields=${fields}` : '';
    const url = `https://${domain}/rest/api/2/issue/${key}${fieldsParam}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Jira API 錯誤' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '服務器錯誤' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Jira Proxy server running on http://localhost:${PORT}`);
});