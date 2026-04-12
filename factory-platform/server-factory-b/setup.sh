#!/bin/bash
# ============================================================
#  Factory B — json-server setup script
#  Same as Factory A but port 3002
# ============================================================

set -e

echo ">>> Installing Node.js (if not installed)"
command -v node >/dev/null 2>&1 || {
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

sudo npm install -g json-server pm2

mkdir -p ~/factory-b
cp machines.json ~/factory-b/machines.json

cd ~/factory-b
pm2 start "json-server --watch machines.json --port 3002 --host 0.0.0.0" --name factory-b
pm2 save
pm2 startup

sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw deny 3002/tcp
sudo ufw --force enable

sudo apt-get install -y nginx

cat <<'EOF' | sudo tee /etc/nginx/sites-available/factory-b
server {
    listen 80;
    server_name factory-b.yourdomain.com;   # <-- change this

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        add_header 'Access-Control-Allow-Origin'  '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
        if ($request_method = OPTIONS) { return 204; }
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/factory-b /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt-get install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d factory-b.yourdomain.com

echo ""
echo "============================================================"
echo "  Factory B server is running."
echo "  API endpoint: http://localhost:3002/machines"
echo "  After DNS + certbot: https://factory-b.yourdomain.com/machines"
echo "============================================================"
