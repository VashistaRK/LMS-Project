// Loader worker that pulls the pdf.js worker from CDN to avoid bundler import issues.
// This worker runs in a dedicated worker thread and uses importScripts to load the official pdf.worker script.
// We pin the version to match the installed pdfjs-dist (5.4.296) used in this workspace.

/* eslint-disable no-undef */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.js');
