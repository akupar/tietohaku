from bs4 import BeautifulSoup
from requests import get
import time

def lovely_soup(u):
    r = get(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/16.0.1'})
    return BeautifulSoup(r.text, 'lxml')

def test(filename):
    with open(filename, "r") as f:
        return BeautifulSoup(f.read(), 'lxml')

def handle_page(url, soup):
    title = soup.find('title')
    print("RADIKAALI: " + title.text.replace("Annexe:Sinogrammes/Radical/", ""))

    h2 = soup.find('h2')

    pos = soup.find(text = "... -")

    print(pos)
    #print("URL: " + url)
    rows = soup.find_all('span', { 'class': 'lang-zh-TW' })
    for row in rows:
    
        print("ROW: " + row.text)

        for elem in row.next_siblings:
            if elem.name and elem.name.startswith('h'):
                # stop at next row
                break
            if elem.name == 'p':
                sinogrammit = elem.get_text().split(", ")
                for sinogrammi in sinogrammit:
                    print(sinogrammi + u'\n')




                    
urls = [
    'http://runeberg.org/fisv1968/',
]


if __name__ == "__main__":
    
    for url in urls:
        #soup = lovely_soup(url)
        soup = test("test.html")
        handle_page(url, soup)
        #time.sleep(5)

#header = soup.find('span', {'id': 'Sinogrammes_à_1_trait'})

