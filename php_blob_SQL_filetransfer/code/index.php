<!DOCTYPE html>
<html>
<head>
    <title>Azure Blob Storage</title>
    <style>
        /* some snuzy */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1, h2 {
            color: #333;
        }
        .upload-form {
            margin-bottom: 30px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        input[type="file"], textarea {
            margin: 10px 0;
            width: 100%;
        }
        textarea {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 100px;
            font-family: Arial, sans-serif;
        }
        input[type="submit"] {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #45a049;
        }
        .file-list {
            list-style-type: none;
            padding: 0;
        }
        .file-item {
            margin: 10px 0;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
            border-left: 4px solid #4CAF50;
        }
        .file-link {
            color: #2196F3;
            text-decoration: none;
            font-weight: bold;
        }
        .file-link:hover {
            text-decoration: underline;
        }
        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success {
            background-color: #dff0d8;
            border-left: 4px solid #4CAF50;
            color: #3c763d;
        }
        .error {
            background-color: #f2dede;
            border-left: 4px solid #d9534f;
            color: #a94442;
        }
        .info {
            background-color: #d9edf7;
            border-left: 4px solid #2196F3;
            color: #31708f;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Azure Blob Storage Manager</h1>
        
        <div class="upload-form">
            <h2>Upload New Files</h2>
            <form action="index.php" method="post" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="fileToUpload">Select file:</label>
                    <input type="file" name="fileToUpload" id="fileToUpload">
                </div>
                
                <div class="form-group">
                    <label for="fileText">File description or content:</label>
                    <textarea name="fileText" id="fileText" placeholder="Enter description or content for this file..."></textarea>
                </div>
                
                <input type="submit" value="Upload File" name="submit">
            </form>
        </div>

<?php
require_once 'vendor/autoload.php';
use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Blob\Models\CreateContainerOptions;
use MicrosoftAzure\Storage\Blob\Models\PublicAccessType;
use MicrosoftAzure\Storage\Blob\Models\ListBlobsOptions;

// UPLOADDDDD
if(isset($_POST["submit"])) {
    $target_dir = "uploads/";
    
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    
    $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
    $uploadOk = 1;
    $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
    
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check !== false) {
        echo "<div class='message success'>File is an image - " . $check["mime"] . ".</div>";
        $uploadOk = 1;
    } else {
        echo "<div class='message error'>File is not an image.</div>";
        $uploadOk = 0;
    }
    
    if (file_exists($target_file)) {
        echo "<div class='message error'>File already exists.</div>";
        $uploadOk = 0;
    }
    
    if ($_FILES["fileToUpload"]["size"] > 500000) {
        echo "<div class='message error'>File is too large.</div>";
        $uploadOk = 0;
    }
    
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
        echo "<div class='message error'>Only JPG, JPEG, PNG & GIF files are allowed.</div>";
        $uploadOk = 0;
    }
    
    if ($uploadOk == 0) {
        echo "<div class='message error'>Your file was not uploaded.</div>";
    } else {
        if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
            echo "<div class='message success'>The file ". htmlspecialchars(basename($_FILES["fileToUpload"]["name"])). " has been uploaded locally.</div>";
            
            function generateRandomString($length = 10) {
                $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
                $charactersLength = strlen($characters);
                $randomString = '';
                for ($i = 0; $i < $length; $i++) {
                    $randomString .= $characters[rand(0, $charactersLength - 1)];
                }
                return $randomString;
            }
                        
            try {
                //conn string here
                //TO BE MODIFIED in need
                $connectionString = "conn string"
                            
                //init using sdk
                $blobClient = BlobRestProxy::createBlobService($connectionString);
                
                //continer name of blob stoare
                //TO BE MODIFIED in need
                $containerName = "public";
                            
                echo "<div class='message info'>Uploading to Azure Blob Storage: " . htmlspecialchars(basename($_FILES["fileToUpload"]["name"])) . "</div>";
                $fileToUpload = basename($_FILES["fileToUpload"]["name"]);
                echo $fileToUpload;
                echo "<br>";
                            
                $content = fopen($target_file, "r");
                            
                $blobClient->createBlockBlob($containerName, $fileToUpload, $content);
                echo "<div class='message success'>File successfully uploaded to Azure Blob Storage.</div>";
                
                //returned blob url
                $blob_store_addr = $blobClient->getBlobUrl($containerName, $fileToUpload);
                
                // get the file_text from input
                $file_text = isset($_POST["fileText"]) ? $_POST["fileText"] : "";
                
                // if no user description provided and it s a text file get content
                if (empty($file_text)) {
                    $file_extension = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
                    if (in_array($file_extension, ['txt', 'html', 'css', 'js', 'json', 'xml', 'md', 'csv', 'log'])) {
                        $file_text = file_get_contents($target_file);
                    }
                }
                
                // conn and insert the metadata in the sql db
                try {
                    echo "<div class='message info'>Uploading metadata to SQL database...</div>";
                    
                    //conn string from azure portal, PUT YOUR DB PASSWORD
                    //TO BE MODIFIED in need
                    $conn = new PDO("sqlsrv:server = tcp:lab07sabin.database.windows.net,1433; Database = laborator", "sabinghost19", "PASSSSS$");
                    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
                    $sql = "INSERT INTO fileinfo (filename, blob_store_addr, file_text) VALUES (?, ?, ?)";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([$fileToUpload, $blob_store_addr, $file_text]);

                    echo "<div class='message success'>File metadata successfully uploaded to SQL database.</div>";

                    //close the file...to be deleted next:(
                    fclose($content);

                    //sterge local file de pe webserver dir uploads
                    if (file_exists($target_file)) {
                        if (unlink($target_file)) {
                            echo "<div class='message info'>Local file deleted after uploading to Azure and database.</div>";
                        } else {
                            echo "<div class='message error'>Could not delete local file: " . $target_file . "</div>";
                        }
                    }
                    
                } catch (Exception $e) {
                    echo "<div class='message error'>Error uploading to SQL database: " . $e->getMessage() . "</div>";
                }
                            
            } catch(Exception $e) {
                echo "<div class='message error'>Error uploading to Azure: " . $e->getMessage() . "</div>";
            }
        } else {
            echo "<div class='message error'>There was an error uploading your file.</div>";
        }
    }
}

echo "<h2>Files in Container</h2>";

try {

    //conn string here
    //TO BE MODIFIED in need
    $connectionString =  "conn string"
    $blobClient = BlobRestProxy::createBlobService($connectionString);
    $containerName = "public";
    
    //modify here the conn with your , dont forget the password
    $conn = new PDO("sqlsrv:server = tcp:lab07sabin.database.windows.net,1433; Database = laborator", "sabinghost19", "PASSSSS");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $listBlobsOptions = new ListBlobsOptions();
    
    $result = $blobClient->listBlobs($containerName, $listBlobsOptions);
    
    if (count($result->getBlobs()) > 0) {
        echo "<ul class='file-list'>";
        foreach ($result->getBlobs() as $blob) {
            $fileName = $blob->getName();
            $fileUrl = $blob->getUrl();
            $lastModified = $blob->getProperties()->getLastModified()->format('Y-m-d H:i:s');
            $size = round($blob->getProperties()->getContentLength() / 1024, 2); // Size in KB
            
            $fileText = "";
            try {
                $sql = "SELECT file_text FROM fileinfo WHERE filename = ?";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$fileName]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result && isset($result['file_text'])) {
                    $fileText = $result['file_text'];
                }
            } catch (Exception $e) {
                $fileText = "Error retrieving file text: " . $e->getMessage();
            }
            
            echo "<li class='file-item'>";
            echo "<a href='".$fileUrl."' target='_blank' class='file-link'>".$fileName."</a>";
            echo "<div>Last modified: ".$lastModified."</div>";
            echo "<div>Size: ".$size." KB</div>";
            
            if (!empty($fileText)) {
                echo "<div class='file-content'>";
                echo "<h4>File Content/Description:</h4>";
                echo "<p>" . htmlspecialchars($fileText) . "</p>";
                echo "</div>";
            }
            
            echo "</li>";
        }
        echo "</ul>";
    } else {
        echo "<div class='message info'>No files in container.</div>";
    }
    
} catch(Exception $e) {
    echo "<div class='message error'>Error listing container contents: " . $e->getMessage() . "</div>";
}
?>

    </div>
</body>
</html>


https://github.com/SabinGhost19

