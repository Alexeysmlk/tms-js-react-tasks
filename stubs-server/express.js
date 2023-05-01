import * as dotenv from 'dotenv';
import express from 'express';

import airlabs from './airlabs/index.js';
import shop from './shop/index.js';
import tasks from './tasks/tasks-v1.js';

dotenv.config();
const app = express();
const port = 3001;

app.use(express.json());

// Airlabs data
app.get('/schedules', airlabs.getScheduledFlights);
app.get('/airlines', airlabs.getAirlineData);
app.get('/airports', airlabs.getAirportsData);

// Tasks API v1
app.get('/tasks', tasks.getAllTasks);
app.post('/tasks/add', tasks.addTask);
app.delete('/tasks', tasks.removeTask);
app.delete('/tasks/all', tasks.removeAllTasks);
app.patch('/tasks/:id', tasks.updateTask);

if (process.env.LOCAL_WITH_DOCKER_DB || process.env.IN_DOCKER) {
  dotenv.config(process.env.IN_DOCKER ? undefined : { path: '../.env' });

  // Tasks API v2
  const { default: tasks_v2 } = await import('./tasks/tasks-v2.js');
  app.get('/tasks/v2', tasks_v2.getAllTasks);
  app.post('/tasks/v2/add', tasks_v2.addTask);
  app.delete('/tasks/v2', tasks_v2.removeTask);
  app.delete('/tasks/v2/all', tasks_v2.removeAllTasks);
  app.patch('/tasks/v2/:id', tasks_v2.updateTask);

  // Orders API
  const { default: orders } = await import('./orders/orders.js');
  app.get('/restaurants', orders.getRestaurants);
  app.get('/offers', orders.getOffers);
  app.get('/orders', orders.getOrders);
  app.post('/orders/init', orders.initOrder);
  app.post('/orders/add-offers', orders.addOffersToOrder);
}

// Shop
app.get('/products', shop.getProducts);

app.listen(port, () => {
  console.log(`Stubs server listening on port ${port}`);
});
