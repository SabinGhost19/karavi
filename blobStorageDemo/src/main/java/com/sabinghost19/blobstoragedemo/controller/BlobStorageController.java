package com.sabinghost19.blobstoragedemo.controller;

import com.sabinghost19.blobstoragedemo.service.BlobStorageService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/storage")
public class BlobStorageController {

    private final BlobStorageService blobStorageService;

    @Autowired
    public BlobStorageController(BlobStorageService blobStorageService) {
        this.blobStorageService = blobStorageService;
    }

    @PostMapping("/upload")
    public Object handleFileUpload(@RequestParam("file") MultipartFile multipartFile) throws IOException {
        blobStorageService.upload(multipartFile.getResource());
        return new ResponseEntity("success", HttpStatus.OK);
    }

    @DeleteMapping("/delete/{fileName}")
    public Object handleFileUpload(@PathVariable String fileName) throws IOException {
        blobStorageService.delete(fileName);
        return new ResponseEntity("success", HttpStatus.OK);
    }

    @GetMapping("/download/{fileName}")
    public @ResponseBody byte[] handleFileDownload(HttpServletResponse response, @PathVariable String fileName) throws IOException {
        response.addHeader("Content-Disposition", "attachment; filename="+fileName);
        return blobStorageService.download(fileName);
    }
}