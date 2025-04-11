import { TrelloBoard, TrelloList, TrelloCard, TrelloData } from '../type';

export const connectToTrello = async (apiKey: string, token: string): Promise<{ connected: boolean }> => {
  try {
    // 簡單驗證 API 金鑰
    if (!apiKey || apiKey.length < 32) {
      throw new Error('無效的 Trello API 金鑰');
    }

    // 這裡可以做一個簡單的 API 請求來確認連接是否成功
    const response = await fetch(`https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`);
    
    if (!response.ok) {
      throw new Error('無法驗證 Trello API 金鑰');
    }
    
    return { connected: true };
  } catch (error) {
    console.error('Trello 連接錯誤:', error);
    throw error;
  }
};

// 獲取用戶的 Trello 卡片數據
export const fetchTrelloCards = async (apiKey: string, token: string): Promise<TrelloData> => {
  try {
    // 獲取用戶信息
    const memberResponse = await fetch(`https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`);
    if (!memberResponse.ok) throw new Error('獲取用戶信息失敗');
    const member = await memberResponse.json();
    // console.log(member)

    
    // 獲取用戶的所有看板
    const boardsResponse = await fetch(`https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}`);
    if (!boardsResponse.ok) throw new Error('獲取看板失敗');
    const boards = await boardsResponse.json();
    // console.log(boards)

    
    // 初始化結果數據
    const result: TrelloData = {
      user: {
        id: member.id,
        username: member.username,
        fullName: member.fullName,
      },
      boards: [],
      cards: []
    };
    
    // 處理每個看板
    for (const board of boards) {
      const boardData: TrelloBoard = {
        id: board.id,
        name: board.name,
        url: board.url,
        lists: []
      };
      
      // 獲取看板中的列表
      const listsResponse = await fetch(`https://api.trello.com/1/boards/${board.id}/lists?key=${apiKey}&token=${token}`);
      if (!listsResponse.ok) continue;
      const lists = await listsResponse.json();
      // console.log(lists)
      
      // 處理每個列表
      for (const list of lists) {
        const listData: TrelloList = {
          id: list.id,
          name: list.name,
          cards: []
        };
        
        // 獲取列表中的卡片
        const cardsResponse = await fetch(`https://api.trello.com/1/lists/${list.id}/cards?key=${apiKey}&token=${token}`);
        if (!cardsResponse.ok) continue;
        const cards = await cardsResponse.json();
        // console.log(cards)

        
        // 處理每張卡片
        for (const card of cards) {
          // 獲取卡片詳細信息，包括描述和成員
          const cardDetailsResponse = await fetch(`https://api.trello.com/1/cards/${card.id}?fields=all&members=true&member_fields=all&key=${apiKey}&token=${token}`);
          if (!cardDetailsResponse.ok) continue;
          const cardDetails = await cardDetailsResponse.json();
          // console.log(cardDetails)

          
          // 檢查卡片是否分配給當前用戶
          const isAssignedToUser = cardDetails.members.some((m: any) => m.id === member.id);
          

          
          const cardData: TrelloCard = {
            id: card.id,
            name: card.name,
            description: cardDetails.desc,
            url: card.url,
            assignedToMe: isAssignedToUser,
            completed: card.dueComplete,
            dueDate: cardDetails.due,
            listName: list.name
          };
          
          // 將卡片添加到列表數據
          listData.cards.push(cardData);
          
          // 如果卡片分配給當前用戶，也添加到總卡片列表
          if (isAssignedToUser) {
            result.cards.push(cardData);
          }
        }
        
        // 將列表添加到看板數據
        boardData.lists.push(listData);
      }
      
      // 將看板添加到結果數據
      result.boards.push(boardData);
    }
    
    return result;
  } catch (error) {
    console.error('獲取 Trello 數據錯誤:', error);
    throw error;
  }
};

// 從 Trello 卡片數據中提取工作摘要
export const extractWorkSummary = (trelloData: TrelloData): string => {
  // 用戶分配的卡片
  const assignedCards = trelloData.cards.filter(card => card.assignedToMe);
  
  // 已完成的卡片
  const completedCards = assignedCards.filter(card => card.completed);
  
  // 未完成的卡片
  const incompleteCards = assignedCards.filter(card => !card.completed);
  
  // 生成工作摘要
  let summary = '### Trello 工作摘要\n\n';
  
  // 已完成工作
  summary += '#### 已完成工作\n';
  if (completedCards.length > 0) {
    completedCards.forEach(card => {
      summary += `- **${card.name}**: ${card.description ? card.description.substring(0, 100) + (card.description.length > 100 ? '...' : '') : '無描述'}\n`;
    });
  } else {
    summary += '- 無已完成的工作項目\n';
  }
  
  // 進行中工作
  summary += '\n#### 進行中工作\n';
  if (incompleteCards.length > 0) {
    incompleteCards.forEach(card => {
      summary += `- **${card.name}**: ${card.description ? card.description.substring(0, 100) + (card.description.length > 100 ? '...' : '') : '無描述'}\n`;
    });
  } else {
    summary += '- 無進行中的工作項目\n';
  }
  
  // 統計數據
  summary += '\n#### 工作統計\n';
  summary += `- 總計負責項目: ${assignedCards.length} 項\n`;
  summary += `- 已完成項目: ${completedCards.length} 項\n`;
  summary += `- 完成率: ${assignedCards.length > 0 ? Math.round((completedCards.length / assignedCards.length) * 100) : 0}%\n`;
  
  return summary;
};