# koder-react
QR code scanner

## Nginx installation 
```
sudo cp deploy/koder-react.conf /etc/nginx/sites-available/koder-react.conf
sudo ln -s /etc/nginx/sites-available/koder-react.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```