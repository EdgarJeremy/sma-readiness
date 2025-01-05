import io from 'socket.io-client';
import { feathers } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import socketio from '@feathersjs/socketio-client';
import authentication from '@feathersjs/authentication-client';

// const socket = io(import.meta.env.VITE_API_URL);
const restClient = rest(import.meta.env.VITE_API_URL);
const feathersClient = feathers();

// @ts-ignore
feathersClient.configure(restClient.fetch(window.fetch.bind(window)));
feathersClient.configure(authentication());

export { restClient, feathersClient };