package com.sabinghost19.blobstoragedemo.service;

import com.azure.storage.blob.BlobAsyncClient;
import com.azure.storage.blob.BlobContainerAsyncClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.ParallelTransferOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.UUID;

@Service
public class BlobStorageService {
    private static final Logger logger = LoggerFactory.getLogger(BlobStorageService.class);
    private static final int DEFAULT_BLOCK_SIZE = 4 * 1024 * 1024; // 4 MB
    private static final int DEFAULT_NUM_BUFFERS = 8;

    private final BlobContainerAsyncClient blobContainerAsyncClient;
    private final String blobBaseUrl;

    @Autowired
    public BlobStorageService(BlobContainerAsyncClient blobContainerAsyncClient) {
        this.blobContainerAsyncClient = blobContainerAsyncClient;
        this.blobBaseUrl = blobContainerAsyncClient.getBlobContainerUrl();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        BlobAsyncClient blobAsyncClient = blobContainerAsyncClient.getBlobAsyncClient(fileName);

        byte[] fileContent = file.getBytes();
        Flux<ByteBuffer> data = Flux.just(ByteBuffer.wrap(fileContent));

        ParallelTransferOptions transferOptions = new ParallelTransferOptions()
                .setBlockSizeLong((long) DEFAULT_BLOCK_SIZE)
                .setMaxConcurrency(DEFAULT_NUM_BUFFERS);

        BlobHttpHeaders headers = new BlobHttpHeaders()
                .setContentType(file.getContentType());

        try {
            blobAsyncClient.upload(data, transferOptions, true)
                    .then(blobAsyncClient.setHttpHeaders(headers))
                    .block();

            logger.info("File successfully uploaded: {}", fileName);

            return blobAsyncClient.getBlobUrl();
        } catch (Exception e) {
            logger.error("Eroare la încărcarea fișierului: {}", e.getMessage());
            throw new IOException("Eroare la încărcarea fișierului: " + e.getMessage(), e);
        }
    }

    public String upload(Resource resource) throws IOException {
        String fileName = resource.getFilename();
        BlobAsyncClient blobAsyncClient = blobContainerAsyncClient.getBlobAsyncClient(fileName);

        byte[] content = resource.getInputStream().readAllBytes();
        Flux<ByteBuffer> data = Flux.just(ByteBuffer.wrap(content));

        ParallelTransferOptions transferOptions = new ParallelTransferOptions()
                .setBlockSizeLong((long) DEFAULT_BLOCK_SIZE)
                .setMaxConcurrency(DEFAULT_NUM_BUFFERS);

        blobAsyncClient.upload(data, transferOptions, true).block();

        return blobAsyncClient.getBlobUrl();
    }

    public boolean delete(String fileName) {
        try {
            BlobAsyncClient blobAsyncClient = blobContainerAsyncClient.getBlobAsyncClient(fileName);
            blobAsyncClient.delete().block();
            logger.info("Fișier șters cu succes: {}", fileName);
            return true;
        } catch (Exception e) {
            logger.error("Eroare la ștergerea fișierului {}: {}", fileName, e.getMessage());
            return false;
        }
    }

    public byte[] download(String fileName) throws IOException {
        try {
            BlobAsyncClient blobAsyncClient = blobContainerAsyncClient.getBlobAsyncClient(fileName);
            return blobAsyncClient.downloadContent().block().toBytes();
        } catch (Exception e) {
            logger.error("Eroare la descărcarea fișierului {}: {}", fileName, e.getMessage());
            throw new IOException("Eroare la descărcarea fișierului: " + e.getMessage(), e);
        }
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    public String getBlobUrl(String fileName) {
        return blobContainerAsyncClient.getBlobAsyncClient(fileName).getBlobUrl();
    }
}