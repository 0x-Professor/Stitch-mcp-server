#!/usr/bin/env node
import { runSetup } from "./setup.js";

runSetup().catch((err) => {
  console.error("An error occurred during setup:", err);
  process.exit(1);
});
