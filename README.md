# Prayer Signup for the Bay Area

## Introduction

This script allows you to easily register for prayers in the Bay Area.

## Usage

```bash
node index.js -p all -d tomorrow -m 696
```

```text
Options:
  --version     Show version number                                    [boolean]
  --prayer, -p  choose your prayer
    [required] [choices: "fajr", "duhr", "asr", "maghrib", "isha", "1st jumuah",
                                              "2nd jumuah", "3rd jumuah", "all"]
  --mosque, -m  mosque id to signup with                                [number]
  --date, -d    date to signup for  [choices: "today", "tomorrow", "overmorrow"]
  --name, -n    name of the person
  --email, -e   email of the person
  --cell, -c    cell no. of the person
  --help        Show help                                              [boolean]
```
