const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const saveDailyRecord = async (data: {
  name: string;
  dailyRecords: any[];
//   apiData: any;
//   fileData: any;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/createdaily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}; 


export const getDailyData = async (name: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/getdaily?name=${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get daily data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting daily data:', error);
    throw error;
  }
}; 

export const deleteDailyData = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/deletedaily?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting daily data:', error);
    throw error;
  }
}; 

interface ClearRecordsPayload {
  yearMonth: string;  // Format: YYYY-MM
  userName: string;
}

export const clearDailyRecords = async (payload: ClearRecordsPayload) => {
  try {
    const response = await fetch(`${API_BASE_URL}api/cleardaily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to clear records');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing records:', error);
    throw error;
  }
}; 
