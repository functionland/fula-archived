
import protons from 'protons';

const messages = protons(`
  syntax = "proto3";

  message Request {
    string msg = 1;
  }
`);

