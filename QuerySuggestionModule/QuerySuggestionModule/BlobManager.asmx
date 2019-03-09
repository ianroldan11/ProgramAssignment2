<%@ WebService Language="C#" Class="BlobManager.BlobWebService" %>
using System;
using System.Web.Services;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace BlobManager
{
    class BlobWebService
    {
        public static readonly string fileDirectory = Directory.GetCurrentDirectory() + "/DataFiles/";
        
        // downloads file from blob storage
        [WebMethod]
        public string DownloadFromAzureBlob(string fileNameToDownload)
        {
            // check if file does not yet exist
            if (!File.Exists(fileDirectory + fileNameToDownload)){
                // creates directory if it does not yet exist
                Directory.CreateDirectory(fileDirectory);
                // get blob container
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(System.Configuration.ConfigurationManager.AppSettings["StorageConnectionString"]);
                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                CloudBlobContainer container = blobClient.GetContainerReference("wikipediablobcontainer");
                // check if blob container exists
                if (container.Exists())
                {
                    // download the file
                    CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileNameToDownload);
                    using (var fileStream = File.OpenWrite(fileDirectory + fileNameToDownload)){
                        blockBlob.DownloadToStream(fileStream);
                    }
                }
                
                return "download finished";
            }
            
            else{
                return "file already exists";
            }
            
        }
        
        // uploads file to blob storage
        [WebMethod]
        public string UploadToAzureBlob(string fileNameToUpload)
        {
            // check if file to be uploaded is present
            if (File.Exists(fileDirectory + fileNameToUpload)){
                Directory.CreateDirectory(fileDirectory);
                // get blob container
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(System.Configuration.ConfigurationManager.AppSettings["StorageConnectionString"]);
                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                CloudBlobContainer container = blobClient.GetContainerReference("wikipediablobcontainer");
                // check if blob container exists
                if (container.Exists())
                {   
                    // upload file
                    CloudBlockBlob blockBlob = container.GetBlockBlobReference(fileNameToUpload);
                    using (var fileStream = File.OpenRead(fileDirectory + fileNameToUpload)){
                        blockBlob.UploadFromStream(fileStream);
                    }
                }
                return "upload finished";
            }
            
            else{
                return "specified file does not exist";
            }
        }
        
        // Methods below will not be used for this project
        
        public void WriteToFile(bool willOverwrite, string fileName, List<string> dataToWrite)
        {
            Directory.CreateDirectory(fileDirectory);
            
            if (willOverwrite)
            {
                File.WriteAllText(fileDirectory + fileName, "");

            }

            StreamWriter streamWriter = new StreamWriter(fileDirectory + fileName, true, Encoding.ASCII);
            foreach (string data in dataToWrite)
            {
                streamWriter.WriteLine(data);
            }

            //close the file
            streamWriter.Close();
        }
        
        public List<string> PreprocessData(List<string> dataList)
        {
            List<string> filteredData = new List<string>();
            int x = 1;
            foreach (string data in dataList)
            {
                Console.Write("Item number: " + x);
                bool checker = IsAlphaNumeric(data);
                if (checker)
                {
                    filteredData.Add(data);
                }
                Console.WriteLine(" - " + checker);
                x++;
            }

            return filteredData;
        }

        public static Boolean IsAlphaNumeric(string strToCheck)
        {
            Regex rg = new Regex(@"^[a-zA-Z\s,_.()']+$");
            return rg.IsMatch(strToCheck);
        }
    
    }
}
