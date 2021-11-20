from requests import get
import time
import re
import json
import unicodedata
import argparse


def fetch(url):
    r = get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1'})
    
    return r.text


def test(filename):
    with open(filename, "r") as f:
        return f.read()

def strip_accents(s):
   return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')
def normalize(hs):
    hs = hs.upper()
    hs = re.sub(u"Å", u"a", hs)
    hs = re.sub(u"Ä", u"b", hs)
    hs = re.sub(u"Ö", u"c", hs)
    hs = re.sub(u"W", u"V", hs)
    hs = re.sub(u"Æ", u"AE", hs)
    hs = re.sub(u"Œ", u"OE", hs)

    hs = strip_accents(hs)
    hs = re.sub("[^A-Za-c]", "", hs)
    
    hs = re.sub(u"a", u"Å", hs)
    hs = re.sub(u"b", u"Ä", hs)
    hs = re.sub(u"c", u"Ö", hs)
    
    return hs
    



def handle_page(url, text, outputf):
    regex = re.compile(r"""<br><a href="[0-9]{4}.html"
 style="text-decoration: none; color: black">([^<]+)</a> -
<a href="([0-9]{4}).html"
 >([^<]+)</a>
""")
    regex = re.compile(r"""<br>(.*) ... -
<a href="([0-9]{4}).html"
 >([-0-9]+)</a>
""")

    for (title, upg, rpg) in re.findall(regex, text):
        title = re.sub("^(&nbsp;)*", "", title)
        obj = [
            normalize(title),
            title,
            {
                "l": upg,
                "s": rpg
            }
        ]
        print(json.dumps(obj, ensure_ascii=False) + ",")
        outputf.write(json.dumps(obj, ensure_ascii=False) + ",\n")
    


urls = [
    'http://runeberg.org/fisv1968/',
]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Hakee Project Runebergin kirjan sisällysluettelon ja muuttaa sen käsin viimeisteltävään Javascript-muotoon.'
    )

    parser.add_argument('--output', '-o', type=str,
                        help='Tulostettavan tiedoston nimi.')

    parser.add_argument('--input', '-i', type=str,
                        help='Luettavan sivun nimi.')

    args = parser.parse_args()

    outputfile = args.output
    inputfile = args.input

    if not outputfile:
        print("Puuttuu kohdetiedoston nimi")
        exit(1)

    if not inputfile:
        print("Puuttuu lähdetiedoston nimi")
        exit(1)
        

    with open(outputfile, "a") as outputf:
        for url in urls:
            #htmltext = fetch(url)
            htmltext = test(inputfile)
            handle_page(url, htmltext, outputf)

            if url != urls[-1]:
                time.sleep(5)
