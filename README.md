# api_marker

npm i 

nodemon index.js


#_don't forget "log_ip" param making request to this server

for clients:
  every time making request to your db make post request to this server with all fields used + client_ip 
  
  ## example: 
  ### add
  requests.post('http://server-with-this-sript.com/add', body={name:name, password:password, log_ip:client_ip}
  mysql.execute("INSERT into users (name, password) VALUES ('admin', 'qwerty123')")
 
  ### update
  requests.post('http://server-with-this-sript.com/update', body={name:name, password:password, log_ip:client_ip}
  mysql.execute("UPDATE users SET password='qwerty123' where name='admin'")
  
  ### view
  user = mysql.execute("SELECT * FROM users WHERE id=2")
  requests.post('http://server-with-this-sript.com/view', body={name:user.name, password:user.password, log_ip:client_ip}
  
  
