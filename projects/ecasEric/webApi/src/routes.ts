import { Router } from 'express';
import { ChatController } from './controllers/chatController.js';
import { AuthController } from './controllers/authController.js';
import { TopicController } from './controllers/topicController.js';
import { QAController } from './controllers/qaController.js';
import { LinkController } from './controllers/linkController.js';
import { ReviewController } from './controllers/reviewController.js';
import { AnalyticsController } from '@policysynth/api/controllers/analyticsController.js';
import WebSocket from 'ws';

export const getControllers = (wsClients: Map<string, WebSocket>) => [
  new ChatController(wsClients),
  new AuthController(wsClients),
  new TopicController(wsClients),
  new QAController(wsClients),
  new LinkController(wsClients),
  new ReviewController(wsClients),
  new AnalyticsController(wsClients), // Existing controller
];

// Export an array of controller classes
export const controllerClasses = [
  ChatController,
  AuthController,
  TopicController,
  QAController,
  LinkController,
  ReviewController,
  AnalyticsController, // Existing controller
];