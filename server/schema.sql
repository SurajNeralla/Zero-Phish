-- Zero Phish Database Schema
-- Run this in your Supabase SQL Editor

-- Table for phishing reports
CREATE TABLE IF NOT EXISTS phishing_reports (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  html_snippet TEXT,
  screenshot TEXT, -- Base64 encoded image
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Table for redirect chains
CREATE TABLE IF NOT EXISTS redirect_chains (
  id BIGSERIAL PRIMARY KEY,
  chain JSONB NOT NULL, -- Array of URLs
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE phishing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect_chains ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all reports
CREATE POLICY "Authenticated users can read reports"
  ON phishing_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert reports (from backend)
CREATE POLICY "Service role can insert reports"
  ON phishing_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow authenticated users to read redirects
CREATE POLICY "Authenticated users can read redirects"
  ON redirect_chains
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert redirects
CREATE POLICY "Service role can insert redirects"
  ON redirect_chains
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_reports_timestamp ON phishing_reports(timestamp DESC);
CREATE INDEX idx_redirects_timestamp ON redirect_chains(timestamp DESC);
