#!/bin/sh -l

du -sh pkg/**/* | grep -v "dist-types\|package.json"