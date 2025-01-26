import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  List, 
  Trash2, 
  X, 
  Save, 
  Repeat, 
  FileEdit 
} from 'lucide-react';

const FocusTodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(25);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Routines state
  const [routines, setRoutines] = useState([]);
  const [routineName, setRoutineName] = useState('');
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // Load routines from local storage on initial render
  useEffect(() => {
    const savedRoutines = JSON.parse(localStorage.getItem('focusTodoRoutines') || '[]');
    setRoutines(savedRoutines);
  }, []);

  // Save routine
  const saveRoutine = () => {
    if (routineName.trim() && tasks.length > 0) {
      const newRoutine = {
        id: Date.now(),
        name: routineName,
        tasks: tasks.map(task => ({
          text: task.text,
          duration: task.duration
        }))
      };

      const updatedRoutines = [...routines, newRoutine];
      setRoutines(updatedRoutines);
      
      // Save to local storage
      localStorage.setItem('focusTodoRoutines', JSON.stringify(updatedRoutines));
      
      // Close modal and reset name
      setIsRoutineModalOpen(false);
      setRoutineName('');
    }
  };

  // Load routine
  const loadRoutine = (routine) => {
    // Create new tasks with unique IDs, appending to existing tasks
    const newTasksToAdd = routine.tasks.map(task => ({
      id: Date.now() + Math.random(), // Ensure unique ID
      text: task.text,
      duration: task.duration,
      completed: false
    }));
  
    // Append new tasks to existing tasks
    const combinedTasks = [...tasks, ...newTasksToAdd];
    setTasks(combinedTasks);

      // Only set the first task as current if no current task exists
    if (!currentTask) {
      const firstTask = newTasksToAdd[0];
      if (firstTask) {
        setCurrentTask(firstTask);
        setTimeRemaining(firstTask.duration);
        setIsRunning(false); // Not automatically running
        }
      }

    setIsSidebarOpen(false);
    setIsRoutineModalOpen(false);
  };

  // Delete routine
  const deleteRoutine = (routineId) => {
    const updatedRoutines = routines.filter(routine => routine.id !== routineId);
    setRoutines(updatedRoutines);
    localStorage.setItem('focusTodoRoutines', JSON.stringify(updatedRoutines));
  };

  // Add a new task
  const addTask = () => {
    if (newTask.trim() && newTaskTime > 0) {
      const task = {
        id: Date.now(),
        text: newTask,
        duration: newTaskTime * 60, // Convert minutes to seconds
        completed: false
      };
      setTasks([...tasks, task]);
      if (!currentTask) {
        setCurrentTask(task);
        setTimeRemaining(task.duration);
        setIsRunning(false); // Not automatically running
      }
      setNewTask('');
      setNewTaskTime(25);
    }
  };


  // Start a task
  const startTask = (task) => {
    setCurrentTask(task);
    setTimeRemaining(task.duration);
    setIsRunning(true);
    setIsSidebarOpen(false); // Close sidebar when starting a task
  };

  useEffect(() => {
    let timer;
    if (isRunning && timeRemaining > 0) {
      // Set interval to decrease timeRemaining every second
      timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && currentTask) {
      // When time is up, mark the task as completed and move to next task
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? { ...task, completed: true } : task
      ));
      skipToNextTask(); // Automatically move to next task
    }
  
    // Clean up interval on component unmount or when timer is paused
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, tasks, currentTask]);

  // Remove a task
  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    // If removed task was current task, move to next task
    if (currentTask && currentTask.id === taskId) {
      const nextTask = updatedTasks.find(task => !task.completed);
      if (nextTask) {
        startTask(nextTask);
      } else {
        setCurrentTask(null);
        setTimeRemaining(0);
        setIsRunning(false);
      }
    }
  };

  // Pause/Resume task
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Move to next task
  const skipToNextTask = () => {
    const currentTaskIndex = tasks.findIndex(task => task.id === currentTask.id);

    if (currentTaskIndex !== -1 && currentTaskIndex + 1 < tasks.length) {
      const nextTask = tasks[currentTaskIndex + 1];
      setTasks(tasks => tasks.map(task =>
        task.id === currentTask.id ? { ...task, completed: true } : task
      ));
      setCurrentTask(nextTask);
      setTimeRemaining(nextTask.duration);
      setIsRunning(true);
    } else {
      setCurrentTask(null);
      setTimeRemaining(0);
      setIsRunning(false);
    }
  };



  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Get next task
  const getNextTask = () => {
    const incompleteTasks = tasks.filter(task => !task.completed && task !== currentTask);
    return incompleteTasks.length > 0 ? incompleteTasks[0] : null;
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {/* Routine Save Modal */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Save Routine</h2>
            <input 
              placeholder="Routine Name" 
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsRoutineModalOpen(false)}
                className="bg-gray-200 text-gray-700 p-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={saveRoutine}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routines Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        z-50 p-6 overflow-y-auto
      `}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task List</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Routines Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Saved Routines</h3>
            <button 
              onClick={() => setIsRoutineModalOpen(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
          {routines.length === 0 ? (
            <p className="text-gray-500 text-center">No saved routines</p>
          ) : (
            routines.map(routine => (
              <div 
                key={routine.id} 
                className="flex justify-between items-center p-3 border-b"
              >
                <div>
                  <span>{routine.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {routine.tasks.length} tasks
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => loadRoutine(routine)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteRoutine(routine.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Existing Task List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Current Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center">No tasks added yet</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`
                  flex justify-between items-center p-3 border-b 
                  ${task.completed ? 'opacity-50 line-through' : ''}
                  ${currentTask && currentTask.id === task.id ? 'bg-blue-50' : ''}
                `}
              >
                <div>
                  <span>{task.text}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {formatTime(task.duration)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {!task.completed && (
                    <button 
                      onClick={() => startTask(task)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Input (top right) */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {/* Task List Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="bg-gray-200 text-gray-700 p-2 rounded"
        >
          <List className="w-6 h-6" />
        </button>

        <input 
          className="border p-2 rounded"
          placeholder="Task description" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <input 
          type="number" 
          className="w-20 border p-2 rounded"
          placeholder="Mins" 
          value={newTaskTime}
          onChange={(e) => setNewTaskTime(Number(e.target.value))}
          min="1"
        />
        <button 
          className="bg-blue-500 text-white p-2 rounded"
          onClick={addTask}
        >
          Add
        </button>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{currentTask.text}</h1>
          
          {/* Subtle Timer */}
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Timer className="w-6 h-6" />
            <span className="text-2xl">{formatTime(timeRemaining)}</span>
          </div>

          {/* Control Buttons */}
          <div className="mt-8 space-x-4">
            <button 
              className="bg-blue-500 text-white p-3 rounded-full"
              onClick={toggleTimer}
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button 
              className="bg-gray-200 text-gray-700 p-3 rounded-full"
              onClick={skipToNextTask}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Next Task Indicator */}
      {getNextTask() && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-500">
          Next: {getNextTask().text}
        </div>
      )}
    </div>
  );
};

export default FocusTodoApp;