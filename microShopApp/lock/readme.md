# MicroShop - Aplicație Demo pentru Docker și Kubernetes

Acesta este un proiect demonstrativ de microservicii implementat în JavaScript (Node.js și React) pentru a învăța și testa Docker și Kubernetes. Aplicația simulează un sistem simplu de e-commerce cu multiple microservicii care comunică între ele.

## Arhitectura aplicației

![Arhitectură Microservicii](architecture-diagram.png)

Aplicația constă din următoarele componente:

1. **Frontend** - Aplicație React pentru interfața utilizator
2. **API Gateway** - Punct de intrare unic pentru toate solicitările API
3. **Auth Service** - Gestionează autentificarea și autorizarea utilizatorilor
4. **Products Service** - Gestionează catalogul de produse și căutarea
5. **Orders Service** - Gestionează procesarea comenzilor
6. **Inventory Service** - Verifică disponibilitatea produselor
7. **Payments Service** - Procesează plățile
8. **Notifications Service** - Trimite notificări utilizatorilor
9. **Email Service** - Trimite email-uri utilizatorilor
10. **Baze de date MongoDB** - Fiecare serviciu are propria bază de date

## Rularea aplicației cu Docker Compose

Pentru a rula întreaga aplicație folosind Docker Compose:

```bash
# Clonează repository-ul
git clone https://github.com/yourusername/microshop.git
cd microshop

# Construiește și pornește toate serviciile
docker-compose up --build
```

Aplicația va fi disponibilă la http://localhost.

## Rularea aplicației în Kubernetes

Pentru a rula aplicația în Kubernetes, urmează acești pași:

```bash
# Asigură-te că ai un cluster Kubernetes funcțional (poți folosi minikube pentru development)
minikube start

# Aplică configurațiile Kubernetes
kubectl apply -f kubernetes/00-namespace.yaml
kubectl apply -f kubernetes/01-config.yaml
kubectl apply -f kubernetes/02-databases.yaml
kubectl apply -f kubernetes/03-backend-services.yaml
kubectl apply -f kubernetes/04-api-gateway.yaml
kubectl apply -f kubernetes/05-frontend.yaml
kubectl apply -f kubernetes/06-hpa.yaml

# Adaugă intrările pentru host în /etc/hosts
echo "$(minikube ip) microshop.local api.microshop.local" | sudo tee -a /etc/hosts
```

Aplicația va fi disponibilă la http://microshop.local.

## Structura proiectului

```
microshop/
├── api-gateway/
├── auth-service/
├── products-service/
├── orders-service/
├── payments-service/
├── inventory-service/
├── notifications-service/
├── email-service/
├── frontend/
├── kubernetes/
│   ├── 00-namespace.yaml
│   ├── 01-config.yaml
│   ├── 02-databases.yaml
│   ├── 03-backend-services.yaml
│   ├── 04-api-gateway.yaml
│   ├── 05-frontend.yaml
│   └── 06-hpa.yaml
└── docker-compose.yml
```

## Funcționalități

- Autentificare și înregistrare utilizatori
- Vizualizare catalog produse
- Procesare comenzi și plăți
- Gestionare inventar
- Sistem de notificări

## Scopul educațional

Acest proiect a fost conceput pentru a demonstra:

1. **Arhitectura Microservicii** - Separarea logicii în servicii independente
2. **Comunicarea între servicii** - REST API și comunicare asincronă
3. **Containerizare cu Docker** - Dockerfile-uri pentru fiecare serviciu
4. **Orchestrare cu Kubernetes** - Deployments, Services, ConfigMaps, Secrets, Ingress, HPA
5. **Persistența datelor** - Utilizarea StatefulSets pentru baze de date
6. **Scalabilitate** - Configurarea auto-scaling pentru servicii critice

## Notă

Acest proiect este destinat exclusiv pentru învățare și nu conține toate măsurile de securitate și optimizările necesare pentru un mediu de producție. În special:

- Autentificarea între servicii este simplificată
- Securitatea datelor este minimă
- Procesarea plăților este simulată
- Gestionarea erorilor și a circuit breaker-urilor este limitată
