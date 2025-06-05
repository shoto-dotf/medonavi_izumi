import { AIType } from '../types';
const API_ENDPOINT = 'https://api.dify.ai/v1/chat-messages';
const API_KEY = 'app-UTXkKP1yVjS7WlwusquhFlcf';

export const fetchDifyResponse = async (
  message: string,
  aiType: AIType
): Promise<string> => {
  try {
    console.log(`Calling Dify API with message: ${message} and aiType: ${aiType}`);
    
    // Updated request body to match Dify API requirements
    const requestBody = {
      conversation_id: null, // Optional, can be null for new conversations
      inputs: {}, // Additional parameters if needed
      query: message,
      response_mode: "blocking",
      user: "shioya0001CL"
    };
    
    console.log('Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer || 'お答えできる情報がありません。';
  } catch (error) {
    console.error('Error fetching from Dify API:', error);
    throw error;
  }
};