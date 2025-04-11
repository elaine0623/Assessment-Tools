import {  JiraIssue, JiraData } from '../type';

// 代理伺服器的基本URL
const PROXY_URL = 'http://localhost:3001';

// 創建帶認證的URL
const createAuthUrl = (endpoint: string, domain: string, email: string, apiToken: string, params: Record<string, string> = {}) => {
  const baseUrl = `${PROXY_URL}${endpoint}`;
  const queryParams = new URLSearchParams({
    domain,
    email,
    apiToken,
    ...params
  });
  
  return `${baseUrl}?${queryParams.toString()}`;
};

// 連接到 Jira API
export const connectToJira = async (
  domain: string,
  email: string,
  apiToken: string
): Promise<{ connected: boolean }> => {
  try {
    if (!domain || !email || !apiToken) {
      throw new Error('缺少連接 Jira 所需參數');
    }

    const formattedDomain = domain.replace(/^https?:\/\//, '');
    const url = createAuthUrl('/api/jira/myself', formattedDomain, email, apiToken);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('無法驗證 Jira 憑證');
    }
    
    return { connected: true };
  } catch (error) {
    console.error('Jira 連接錯誤:', error);
    throw error;
  }
};

// 獲取用戶的 Jira 問題數據
export const fetchJiraIssues = async (
  domain: string,
  email: string,
  apiToken: string
): Promise<JiraData> => {
  try {
    const formattedDomain = domain.replace(/^https?:\/\//, '');
    
    // 初始化結果數據
    const result: JiraData = {
      user: {
        id: '',
        username: email,
        displayName: ''
      },
      projects: [],
      issues: []
    };
    
    // 1. 獲取用戶資訊
    const userUrl = createAuthUrl('/api/jira/myself', formattedDomain, email, apiToken);
    const userResponse = await fetch(userUrl);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      result.user = {
        id: userData.accountId,
        username: userData.emailAddress,
        displayName: userData.displayName
      };
    } else {
      throw new Error('獲取用戶資訊失敗');
    }
    
    // 2. 獲取項目列表
    const projectsUrl = createAuthUrl('/api/jira/projects', formattedDomain, email, apiToken);
    const projectsResponse = await fetch(projectsUrl);
    
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      
      for (const project of projectsData) {
        result.projects.push({
          id: project.id,
          key: project.key,
          name: project.name,
          issues: []
        });
      }
    }
    
    // 3. 獲取任務列表
    const jql = `assignee = currentUser() ORDER BY updated DESC`;
    const searchUrl = createAuthUrl('/api/jira/search', formattedDomain, email, apiToken, { jql, maxResults: '50' });
    const issuesResponse = await fetch(searchUrl);
    
    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      
      // 處理每個問題
      for (const issue of issuesData.issues) {
        const issueUrl = createAuthUrl(`/api/jira/issue/${issue.key}`, formattedDomain, email, apiToken, { 
          fields: 'summary,description,status,created,updated,project' 
        });
        
        const issueDetailResponse = await fetch(issueUrl);
        
        if (issueDetailResponse.ok) {
          const issueDetail = await issueDetailResponse.json();
          
          const issueInfo: JiraIssue = {
            id: issue.id,
            key: issue.key,
            summary: issueDetail.fields.summary,
            description: issueDetail.fields.description || '',
            status: issueDetail.fields.status ? issueDetail.fields.status.name : 'Unknown',
            created: issueDetail.fields.created,
            updated: issueDetail.fields.updated,
            projectKey: issueDetail.fields.project.key,
            projectName: issueDetail.fields.project.name,
            assignedToMe: true
          };
          
          // 添加問題到列表
          result.issues.push(issueInfo);
          
          // 添加問題到對應項目
          const projectIndex = result.projects.findIndex(p => p.key === issueInfo.projectKey);
          if (projectIndex !== -1) {
            result.projects[projectIndex].issues.push(issueInfo);
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('獲取 Jira 數據錯誤:', error);
    throw error;
  }
};

// 從 Jira 問題數據中提取工作摘要
export const extractWorkSummary = (jiraData: JiraData): string => {
  // 獲取用戶分配的問題
  const assignedIssues = jiraData.issues.filter(issue => issue.assignedToMe);
  
  // 已完成的問題
  const completedIssues = assignedIssues.filter(
    issue => issue.status === 'Done' || issue.status === 'Closed' || issue.status === 'Resolved'
  );
  
  // 進行中的問題
  const inProgressIssues = assignedIssues.filter(
    issue => issue.status === 'In Progress' || issue.status === 'In Review'
  );
  
  // 待處理的問題
  const todoIssues = assignedIssues.filter(
    issue => issue.status === 'To Do' || issue.status === 'Open' || issue.status === 'New'
  );
  
  // 生成工作摘要
  let summary = '### Jira 工作摘要\n\n';
  
  // 已完成工作
  summary += '#### 已完成工作\n';
  if (completedIssues.length > 0) {
    completedIssues.forEach(issue => {
      summary += `- **${issue.key}: ${issue.summary}**: ${issue.description ? issue.description.substring(0, 100) + (issue.description.length > 100 ? '...' : '') : '無描述'}\n`;
    });
  } else {
    summary += '- 無已完成的工作項目\n';
  }
  
  // 進行中工作
  summary += '\n#### 進行中工作\n';
  if (inProgressIssues.length > 0) {
    inProgressIssues.forEach(issue => {
      summary += `- **${issue.key}: ${issue.summary}**: ${issue.description ? issue.description.substring(0, 100) + (issue.description.length > 100 ? '...' : '') : '無描述'}\n`;
    });
  } else {
    summary += '- 無進行中的工作項目\n';
  }
  
  // 待處理工作
  summary += '\n#### 待處理工作\n';
  if (todoIssues.length > 0) {
    todoIssues.forEach(issue => {
      summary += `- **${issue.key}: ${issue.summary}**: ${issue.description ? issue.description.substring(0, 100) + (issue.description.length > 100 ? '...' : '') : '無描述'}\n`;
    });
  } else {
    summary += '- 無待處理的工作項目\n';
  }
  
  // 統計數據
  summary += '\n#### 工作統計\n';
  summary += `- 總計負責問題: ${assignedIssues.length} 項\n`;
  summary += `- 已完成問題: ${completedIssues.length} 項\n`;
  summary += `- 完成率: ${assignedIssues.length > 0 ? Math.round((completedIssues.length / assignedIssues.length) * 100) : 0}%\n`;
  
  return summary;
};