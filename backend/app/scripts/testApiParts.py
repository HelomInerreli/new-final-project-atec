import requests

#languages: 4 - en, 15 - pt
#countries: 75 76 82 - Europe, 183 - Portugal
#manufacturerId: 5 - Audi, 45 - Honda, 74 - Mercedes
#model id Insigt: 8040
#vehicle id Insigt: 31104, 56184, 124574
#Category parts id: 103099- Tyres, 100002 100700 - Engine

typeId = 1
manufacturerId = 45
langId = 4
countryFilterId = 183
vehicleId = 56184
categoryId = 103099

# url = f"https://auto-parts-catalog.p.rapidapi.com/models/list/type-id/{typeId}/manufacturer-id/{manufacturerId}/lang-id/{langId}/country-filter-id/{countryFilterId}"

url = f"https://auto-parts-catalog.p.rapidapi.com/articles/list/type-id/{typeId}/vehicle-id/{vehicleId}/category-id/{categoryId}/lang-id/{langId}"
headers = {
	"x-rapidapi-key": "8d985c9085msh49973d1b84672e4p1fbe04jsnb6df74b72b15",
	"x-rapidapi-host": "auto-parts-catalog.p.rapidapi.com"
}

response = requests.get(url, headers=headers)

print(response.json())