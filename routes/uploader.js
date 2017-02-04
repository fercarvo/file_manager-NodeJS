var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var mongoose = require('mongoose');
var File = require('../models/File.js');
var fs = require("fs");

module.exports = router;

//Metodo que agrega uno o varios archivos a la base de datos
//Archivos van en form-data tipo file en el body
router.post('/files', function(req, res, next){
  var files = [];
  var form = new formidable.IncomingForm();
  var files_metadata = [];
  form.parse(req);

  form.on('fileBegin', function (name, file){
    var new_name = Date.now() + '_' + file.name;
    file.path = __dirname + '/../public/uploads/' + new_name;

    var file = new File({
      original_name: file.name,
      new_name: new_name
    });

    file.save(function(err, doc){
    		if (err) {
    			return next(err);
    		} else {
          files_metadata.push(doc);
          res.json(doc);
    		}
    });

  });

  form.on('file', function(field, file) {
      files.push({"field": field, "file": file});
      //console.log('files xxxxxxxxxx ' + files.length);
  })
  form.on('end', function() {
    console.log(files.length + ' archivos agregados');
  });

});

//Obtienes un archivo
router.get('/files/:id', function(req, res, next){
  File.findOne({_id:req.params.id}, function(err, doc){
		if (err) {
			return next(err);
		} else if (doc) { //validacion de la existencia metadata
      var path = __dirname + '/../public/uploads/' + doc.new_name;
      fs.access(path, function(err){ //validacion de la existencia de la data
        if (err) {
          res.json({message: 'this file does not exist'});
        } else {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition" : "inline; filename=" + doc.new_name
          });

          var readStream = fs.createReadStream(path);
    		  readStream.pipe(res);
        }
      });
		} else {
		    res.json({message: 'this file does not exist'});
		}
	});
});

//Obtienes la metadata de un archivo
router.get('/files/:id/metadata', function(req, res, next){
  File.findOne({_id:req.params.id}, function(err, doc){
		if (err) {
			return next(err);
		} else if (doc) { //validacion de la existencia metadata
      res.json(doc);
		} else {
		    res.json({message: 'this file does not exist'});
		}
	});
});

//Obtienes una lista de todos los archivos del sistema
router.get('/files', function(req, res){
  File.find({}, function(err, docs){
		if (err) {
			return next(err);
		}
		res.json(docs);
	});
});


//Deputa la metadata del sistema, elimina los registros que no tienen un archivo asociado.
router.post('/files/depure', function(req, res){
  File.find({}, function(err, docs){
		if (err) {
			return next(err);
		} else {
      docs.forEach(function(doc){
        fs.access(__dirname + '/../public/uploads/' + doc.new_name, function(err){
            if (err) {
              File.remove({new_name: doc.new_name}, function(err){
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(doc.new_name + ' deleted from metadata');
                  }
              });
            }
        });
      });
      res.json({message: "DFS has been depured"});
		}
	});
});

//Elimina un archivo
router.delete('/files/:id', function(req, res, next){
  File.findOne({_id:req.params.id}, function(err, doc){
		if(err){
			return next(err);
		} else if (doc) {
      var path = __dirname + '/../public/uploads/'+ doc.new_name;
      fs.access(path, function(err){ //se valida si la ruta (archivo) existe
        if (err) {
          res.json({message: 'this file does not exist'});
        } else { //Si el archivo existe, entra aqui
          fs.unlink(path, function(err){
              if (err) { //cualquier error al eliminar el archivo
                  return next(err);
              } else {
                doc.remove();
                console.log('\n' + doc.new_name + ' has been deleted');
                res.json({message: 'this file has been deleted', file: doc});
              }
          });
        }
      });
    } else {
		    res.json({message: 'this file does not exist'});
		}
  });
});

//actualiza el archivo, se tiene que enviar solamente 1 archivo.
router.put('/files/:id', function(req, res, next){

  var form = new formidable.IncomingForm();
  form.parse(req);
  form.on('fileBegin', function (name, file){

    var new_file_name = Date.now() + '_' + file.name; //Nombre del archivo entrante
    file.path = __dirname + '/../public/uploads/' + new_file_name;


    File.findOne({_id:req.params.id}, function(err, doc){
  		if (err) {
        fs.unlink(file.path, function(err){
            if (err) { //cualquier error al eliminar el archivo
                return next(err);
            } return next(err);
          });
  		} else if (doc) { //validacion de la existencia metadata
        var path = __dirname + '/../public/uploads/' + doc.new_name; //path del archivo a eliminar
        fs.access(path, function(err){ //validacion de la existencia de la data
          if (err) {
            res.json({message: 'this file does not exist'});
          } else {
            fs.unlink(path, function(err){
                if (err) { //cualquier error al eliminar el archivo
                    return next(err);
                } else {
                  console.log('se elimino el archivo viejo');
                  doc.new_name = new_file_name;
                  doc.changed = "true";
                  doc.save(function(err){
                    if (err) {
                      return next(err);
                    } else {
                      res.json({message: "Se actualizo con exito"});
                    }
                  });
                }
            });
          }
        });
  		} else {
        fs.unlink(file.path, function(err){
            if (err) { //cualquier error al eliminar el archivo
                return next(err);
            }
            res.json({message: 'this file does not exist'});
        });
  		}
  	});

  });

});
