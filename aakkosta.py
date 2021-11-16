#!/usr/bin/python
# -*- encoding: utf-8 -*-

import sys
import codecs
import re
import unicodedata

UTF8Reader = codecs.getreader('utf8')
sys.stdin = UTF8Reader(sys.stdin)
UTF8Writer = codecs.getwriter('utf8')
sys.stdout = UTF8Writer(sys.stdout)

def strip_accents(s):
   return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')
def muuta(hs):
    hs = hs.upper()
    hs = re.sub(u"Å", u"a", hs)
    hs = re.sub(u"Ä", u"b", hs)
    hs = re.sub(u"Ö", u"c", hs)
    hs = re.sub(u"W", u"V", hs)
    hs = re.sub(u"Æ", u"AE", hs)
    hs = re.sub(u"Œ", u"OE", hs)

    hs = strip_accents(hs)
    hs = re.sub("[^A-Za-c]", "", hs)
    return hs

def kasittele(m):
    hs = m.group(1)
    aak = muuta(hs)
    return u'"' + aak + u'", "' + hs + u'",'

for line in sys.stdin:
    if re.match(u'\s*\[ null', line):
        print u"%s" % (re.sub(u'null, "([^"]+)",', kasittele, line)),
    else:
        print u"%s" % line,



