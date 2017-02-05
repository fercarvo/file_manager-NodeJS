var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var mongoose = require('mongoose');
var File = require('../models/File.js');
var fs = require("fs");
var path = require('path');
var async = require('async');

var uploads_dir = __dirname + '/../public/uploads/';
module.exports = router;

//Metodo que agrega uno o varios archivos a la base de datos
//Archivos van en form-data tipo file en el body
router.post('/files', function(req, res, next){
  var files = [];
  var form = new formidable.IncomingForm();

  form.uploadDir = uploads_dir;

  form.parse(req);

  form.on('file', function(name, file) {
    //console.log(files);
    files.push({
      name: file.name,
      path: path.basename(file.path),
      size: file.size,
      type: file.type
    });

  });

  form.on('end', function() {
    var docs = []
    async.each(files, function(file, callback){

      var file = new File(file);
      file.save(function(err, doc){
          if (err) {
            console.log(err);
            callback(err);
          } else {
            docs.push(doc);
            callback();
          }
      });

    }, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log(docs.length + ' archivos agregados');
        res.json(docs);
      }
    });
  });

});

//Obtienes un archivo
router.get('/files/:id', function(req, res, next){
  File.findOne({_id:req.params.id}, function(err, doc){
		if (err) {
			return next(err);
		} else if (doc) { //validacion de la existencia metadata
      var path = uploads_dir + doc.path;
      fs.access(path, function(err){
        if (err) { //Si el archivo no existe...
          res.json({message: 'this file does not exist'});
        } else { //Si el archivo existe...
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition" : "inline; filename=" + doc.name
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
router.post('/files/depure', function(req, res, next){
  File.find({}, function(err, docs){
		if (err) {
			return next(err);
		} else {
      docs.forEach(function(doc){
        fs.access(uploads_dir + doc.path, function(err){
            if (err) { //Si no existe el archivo...
              File.remove({_id: doc._id}, function(err){
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(doc.name + ' (' + doc.path + ') deleted from metadata');
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
      var path = uploads_dir + doc.path;
      fs.access(path, function(err){
        if (err) { //Si el documento no existe...
          res.json({message: 'this file does not exist'});
        } else { //Si el socumento existe...
          fs.unlink(path, function(err){
              if (err) { //cualquier error al eliminar el archivo
                  return next(err);
              } else {
                doc.remove();
                console.log(doc.name + ' (' + doc.path + ') has been deleted');
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
    file.path = uploads_dir + new_file_name;


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
