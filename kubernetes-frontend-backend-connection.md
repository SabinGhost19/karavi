## Arhitectura solutiei

Am folosit urmatoarele componente:

- Pod pentru backend
- Pod pentru frontend (aplicatie Angular)
- Serviciu NodePort pentru backend
- Serviciu NodePort pentru frontend
- Configuratie in Angular pentru conexiunea cu backend-ul

Am construit imaginile Docker pentru aplicatiile mele:

1. Am construit imaginea pentru frontend
2. Am construit imaginea pentru backend
3. Le-am urcat pe Docker Hub pentru a putea fi accesate de Kubernetes

### Crearea deployment-ului pentru frontend

Apoi am creat deployment-ul pentru aplicatia Angular. Acesta creeaza un pod care ruleaza imaginea mea de frontend:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend-service
  template:
    metadata:
      labels:
        app: frontend-service
    spec:
      containers:
        - name: frontend-service
          image: sabinghost19/frontend-testnew:latest
```

In imaginea furnizata se poate vedea configuratia deployment-ului care specifica label-ul `app: frontend-service` si imaginea `sabinghost19/frontend-testnew:latest` care este preluata din Docker Hub-ul meu

### Crearea serviciului pentru frontend

Pentru a accesa frontend-ul din browser, am creat un serviciu NodePort:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend-service
  ports:
    - name: frontend-service
      protocol: TCP
      port: 4200
      targetPort: 4200
      nodePort: 30055
  type: NodePort
```

Acest serviciu expune aplicatia Angular pe portul 30055 al nodului Kubernetes, facand forward catre portul 4200 al podului

### Verificarea serviciilor

Dupa ce am aplicat toate configuratiile, am verificat serviciile create:

```bash
kubectl get service
```

Rezultatul arata toate serviciile configurate:

- backend-nodeport-service: tip NodePort, port 8080:30080
- frontend: tip NodePort, port 4200:30055

### Configurarea Angular pentru conexiunea cu backend-ul

Partea cea mai importanta a fost configurarea aplicatiei Angular pentru a comunica cu backend-ul. In fisierul `environment.ts` am adaugat:

```typescript
export const environment = {
  apiUrl: "http://192.168.49.2:30080",
};
```

unde '192.168.49.2' este adresa ip a minikube

Aceasta configuratie permite Angular sa trimita cereri catre backend folosind IP-ul nodului Kubernetes (192.168.49.2) si portul NodePort al serviciului backend (30080)

Initial am incercat sa folosesc numele serviciului (`backend-clusterip-service`), dar am realizat ca acest nume poate fi rezolvat doar in interiorul clusterului Kubernetes, nu si din browser.

### Testarea aplicatiei

Dupa implementarea tuturor configuratiilor, am accesat frontend-ul in browser la adresa `http://192.168.49.2:30055`.

Aplicatia s-a incarcat corect si a afisat datele primite de la backend - o lista cu produse si preturile lor, demonstrand ca conexiunea intre frontend si backend functioneaza

## Tips and Tricks:

1. **Utilizarea IP-ului nodului**: Intotdeauna foloseste IP-ul nodului Kubernetes si portul NodePort pentru conexiunile din browser, nu numele serviciilor interne

2. **Verificarea conexiunii**: Poti verifica conexiunea prin inspectarea consolei browser-ului pentru a vedea daca exista erori de retea

3. **Configuratii separate**: Mentine configuratiile frontend si backend separate pentru a putea face modificari independent
