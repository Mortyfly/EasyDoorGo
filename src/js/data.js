// Gestion des données
class DataManager {
  constructor() {
    this.allData = [];
    this.streetsData = [];
    this.loadData();
    this.setupEventListeners();
  }

  loadData() {
    this.allData = JSON.parse(localStorage.getItem('allData')) || [];
    this.streetsData = JSON.parse(localStorage.getItem('streetsData')) || [];
    this.updateStreetSelections();
  }

  // ... autres méthodes de gestion des données ...
}