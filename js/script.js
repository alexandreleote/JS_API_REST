var map = L.map('map').setView([46.603354, 1.888334], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const inputCP = document.querySelector('.cp');

const selectVille = document.querySelector('.ville');

inputCP.addEventListener('input', () => {
    let value = inputCP.value;

    selectVille.innerHTML = ''; 
    
    let defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.innerHTML = 'Sélectionner une ville';
    defaultOption.selected = true;  
    defaultOption.disabled = true;  
    selectVille.appendChild(defaultOption);

    fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&fields=region,nom,code,codesPostaux,codeRegion&format=json&geometry=centre`)
        .then(response => response.json())
        .then((data) => {
            data.forEach((ville) => {
                let option = document.createElement('option');
                option.value = `${ville.code}`;
                option.innerHTML = `${ville.nom}`;
                selectVille.appendChild(option);
            });
        });
});

selectVille.addEventListener('change', (event) => {
    const selectedCode = event.target.value;

    if (!selectedCode) {
        console.log('Aucune ville sélectionnée');
        return; 
    }

    const selectedVille = event.target.options[event.target.selectedIndex].text;

    console.log('Code ville sélectionné:', selectedCode);
    console.log('Nom de la ville:', selectedVille);


    fetch(`https://geo.api.gouv.fr/communes/${selectedCode}?fields=centre,nom`)
        .then(response => {
            console.log('Réponse de la requête:', response);
            return response.json();
        })
        .then((ville) => {
            console.log('Détails de la ville:', ville);

            if (ville.centre && ville.centre.coordinates) {
                const [lon, lat] = ville.centre.coordinates;
                console.log('Coordonnées (lon, lat):', lon, lat);

                if (!isNaN(lat) && !isNaN(lon)) {
                    
                    map.setView([lat, lon], 13);

                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    L.marker([lat, lon])
                        .addTo(map)
                        .bindPopup(selectedVille)
                        .openPopup();
                } else {
                    console.error('Coordonnées invalides:', lat, lon);
                }
            } else {
                console.error('Coordonnées manquantes dans la réponse', ville);
            }
        })
        .catch(error => {
            console.error('Erreur complète:', error);
        });
});