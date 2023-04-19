#!/usr/bin/env node
import { syncSongs } from "."
import { getValueFromArgs } from "./lib/args"

const limit =parseInt(getValueFromArgs("--limit","-l") as string) || undefined
syncSongs( limit )
