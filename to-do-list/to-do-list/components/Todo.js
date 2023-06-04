import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [stopwatch, setStopwatch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [textColor, setTextColor] = useState('#000'); // 글자 색상 상태 추가
  const intervalRef = useRef(null);

  useEffect(() => {
    getTodosFromUserDevice();
  }, []);

  useEffect(() => {
    saveTodoToUserDevice(todos);
  }, [todos]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStopwatch((prevStopwatch) => prevStopwatch + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const addTodo = () => {
    if (textInput === '') {
      Alert.alert('Error', 'Please input todo');
    } else {
      const newTodo = {
        id: Math.random(),
        task: textInput,
        completed: false,
        priority: 0,
      };
      setTodos([...todos, newTodo]);
      setTextInput('');
    }
  };

  const saveTodoToUserDevice = async (todos) => {
    try {
      const stringifyTodos = JSON.stringify(todos);
      await AsyncStorage.setItem('todos', stringifyTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const getTodosFromUserDevice = async () => {
    try {
      const todos = await AsyncStorage.getItem('todos');
      if (todos !== null) {
        setTodos(JSON.parse(todos));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markTodoComplete = (todoId) => {
    const newTodosItem = todos.map((item) => {
      if (item.id === todoId) {
        return { ...item, completed: true };
      }
      return item;
    });

    setTodos(newTodosItem);
  };

  const TodoCompleteCancel = (todoId) => {
    const newTodosItem = todos.map((item) => {
      if (item.id === todoId) {
        return { ...item, completed: false };
      }
      return item;
    });

    setTodos(newTodosItem);
  };

  const deleteTodo = (todoId) => {
    const newTodosItem = todos.filter((item) => item.id !== todoId);
    setTodos(newTodosItem);
  };

  const increasePriority = (todoId) => {
    const todoIndex = todos.findIndex((item) => item.id === todoId);
    if (todoIndex > 0) {
      const newTodos = [...todos];
      const temp = newTodos[todoIndex];
      newTodos[todoIndex] = newTodos[todoIndex - 1];
      newTodos[todoIndex - 1] = temp;
      setTodos(newTodos);
    }
  };

  const decreasePriority = (todoId) => {
    const todoIndex = todos.findIndex((item) => item.id === todoId);
    if (todoIndex < todos.length - 1) {
      const newTodos = [...todos];
      const temp = newTodos[todoIndex];
      newTodos[todoIndex] = newTodos[todoIndex + 1];
      newTodos[todoIndex + 1] = temp;
      setTodos(newTodos);
    }
  };

  const ListItem = ({ todo }) => {
    return (
      <>
        <TouchableOpacity style={styles.listItem}>
          {!todo.completed && (
            <TouchableOpacity onPress={() => markTodoComplete(todo.id)}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: '#CCF2F4' },
                ]}
              >
                <Icon
                  name="check-box-outline-blank"
                  size={30}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          )}
          {todo.completed && (
            <TouchableOpacity onPress={() => TodoCompleteCancel(todo.id)}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: '#CCF2F4' },
                ]}
              >
                <Icon name="check-box" size={30} color="white" />
              </View>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.task,
                {
                  textDecorationLine: todo.completed
                    ? 'line-through'
                    : 'none',
                  color: textColor, // 글자 색상 적용
                },
              ]}
            >
              {todo.task}
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF3A30' }]}>
              <Icon name="delete" size={30} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => increasePriority(todo.id)}>
            <View
              style={[styles.actionIcon, { backgroundColor: '#F2D572' }]}
            >
              <Icon name="arrow-upward" size={30} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => decreasePriority(todo.id)}>
            <View
              style={[styles.actionIcon, { backgroundColor: '#B7B7B7' }]}
            >
              <Icon name="arrow-downward" size={30} color="white" />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </>
    );
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${
      seconds < 10 ? '0' + seconds : seconds
    }`;
  };

  const startStopwatch = () => {
    setIsRunning(true);
  };

  const stopStopwatch = () => {
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    setStopwatch(0);
    setIsRunning(false);
  };

  const changeTextColor = () => {
    setTextColor(textColor === '#000' ? '#F00' : '#000');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    innerContainer: {
      flex: 1,
    },
    heading: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    textInput: {
      flex: 1,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginRight: 8,
      paddingHorizontal: 8,
    },
    addButton: {
      backgroundColor: '#147efb',
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    stopwatchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    stopwatchText: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    stopwatchButtonContainer: {
      flexDirection: 'row',
    },
    stopwatchButton: {
      marginHorizontal: 8,
      backgroundColor: '#FF3A30',
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stopwatchButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    todoList: {
      flex: 1,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    task: {
      fontSize: 20,
      marginRight: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>할 일 목록</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="할 일을 입력하세요"
            value={textInput}
            onChangeText={(text) => setTextInput(text)}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addTodo}
          >
            <Text style={styles.addButtonText}>추가</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.stopwatchContainer}>
          <Text style={styles.stopwatchText}>
            {formatTime(stopwatch)}
          </Text>
          <View style={styles.stopwatchButtonContainer}>
            {!isRunning && (
              <TouchableOpacity
                style={styles.stopwatchButton}
                onPress={startStopwatch}
              >
                <Text style={styles.stopwatchButtonText}>
                  시작
                </Text>
              </TouchableOpacity>
            )}
            {isRunning && (
              <TouchableOpacity
                style={styles.stopwatchButton}
                onPress={stopStopwatch}
              >
                <Text style={styles.stopwatchButtonText}>
                  정지
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.stopwatchButton}
              onPress={resetStopwatch}
            >
              <Text style={styles.stopwatchButtonText}>
                초기화
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={changeTextColor}> {/* 스타일 변경 버튼 */}
          <Text>글자색 변경</Text>
        </TouchableOpacity>
        <FlatList
          style={styles.todoList}
          data={todos}
          renderItem={({ item }) => <ListItem todo={item} />}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

export default TodoApp;
