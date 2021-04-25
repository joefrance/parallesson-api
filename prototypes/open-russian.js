import fs from 'fs';
import parse from 'csv-parse';

/*
docker run \
--detach \
--name=open-russian \
--env="MYSQL_ROOT_PASSWORD=orpassword" \
--publish 6603:3306 \
--volume=/root/docker/open-russian/conf.d:/etc/mysql/conf.d \
mysql
*/

// docker run -d --name mysql-server -p 3306:3306 -e "MYSQL_ROOT_PASSWORD=orpassword" mysql
// docker run -d --name mysql-server -p 3306:3306 -v /var/lib/mysql:/var/lib/mysql -e "MYSQL_ROOT_PASSWORD=orpassword" mysql

// https://en.openrussian.org/dictionary
const fileContent = fs.readFileSync('/Users/joefrance/Downloads/openrussian-csv/words.csv', 'utf8');

parse(fileContent, {
    comment: '#',
    delimiter: "\t",
    columns: true,
    escape: false,
    trim: true
  }, function(err, records){
    if(err) {
        console.log(err)
    } else {
        console.log(records)
    }
  })

