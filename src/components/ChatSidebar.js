import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatSidebar = ({ setIndex, userid }) => {
  const [topics, setTopics] = useState([]);
  const [newTopicName, setNewTopicName] = useState('New Chat');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/topics');
        const filteredTopics = response.data
          .filter(topic => topic.userid === userid)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTopics(filteredTopics);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, [userid]);

  const handleDelete = async (id, index) => {
    try {
      await axios.delete(`http://localhost:5000/api/topics/${id}`);
      await axios.delete(`http://localhost:5000/api/chats/user/${userid}/index/${index}`);
      setTopics(topics.filter(topic => topic._id !== id));
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleNewTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const newIndex = topics.length ? Math.max(...topics.map(topic => topic.index)) + 1 : 1;
      const newTopic = {
        topicname: newTopicName,
        userid: userid,
        created_at: new Date().toISOString(),
        index: newIndex
      };

      console.log('Creating new topic:', newTopic);

      const response = await axios.post('http://localhost:5000/api/topics', newTopic);
      setTopics([...topics, response.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setNewTopicName('New Chat');
      setIndex(newIndex);
    } catch (error) {
      console.error('Error creating new topic:', error.response || error);
    }
  };

  return (
    <div className="chat-sidebar">
      <h2>Topics</h2>
      <ul>
        {topics.map(topic => (
          <li key={topic._id} onClick={() => setIndex(topic.index)}>
            <span>{topic.topicname}</span>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(topic._id, topic.index); }}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={handleNewTopic}>Add Topic</button>
      </div>
    </div>
  );
};

export default ChatSidebar;