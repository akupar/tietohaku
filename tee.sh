#!/bin/sh

for n in $(ls -1 *.js); do 
    python aakkosta.py < $n > k$n
done
