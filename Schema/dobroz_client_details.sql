-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dobroz
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client_details`
--

DROP TABLE IF EXISTS `client_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(100) DEFAULT NULL,
  `account_type` varchar(100) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `email` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(100) DEFAULT NULL,
  `image_urls` json DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price_per_slot` decimal(38,2) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','PENDING') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_details`
--

LOCK TABLES `client_details` WRITE;
/*!40000 ALTER TABLE `client_details` DISABLE KEYS */;
INSERT INTO `client_details` VALUES (1,'15549655233','Current','Les Corts','Spain','Barcelona','987-562-3488',NULL,'Barca Stadium, the best you see can experience today..','campnou@gmail.com','SBIN0001234','[\"https://i.postimg.cc/qqWT1KQw/camp-nou.jpg\"]',412251.5,20721.6,'Camp Nou',100000.00,'Spain','ACTIVE','2025-06-02 12:53:16.080390','campnou@upi','https://www.fcbarcelona.com/en/club/facilities/spotify-camp-nou','08028'),(2,'15549655233','Current',' Av. de Concha Espina','Spain','Madrid','987-563-4582',NULL,'Santiago Bernabeu Stadium is a retractable roof football stadium in Madrid, Spain. With a seating capacity of approximately 80,000 following its extensive renovation completed in late 2024, the stadium has the second-largest seating capacity for a football stadium in Spain.','realmadrid@gmail.com','SBIN0001234','[\"https://i.postimg.cc/qBF4Bf0K/New-Bernab-u-Stadium.jpg\"]',40.453,3.6883,'Santiago Bernabeu',99999.99,'Spain','ACTIVE','2025-06-02 12:53:01.961609','santiago@upi','https://www.realmadrid.com/en-US/bernabeu-stadium','28036'),(3,'15549655233','Current','Panthaloor Padam, Kunnamkulam- Wadakancherry Road','Panithadam','Thrissur','879-326-5231',NULL,'The right sport for you events with the advanced spatial area to park and organise your events..','alameen@gmail.com','SBIN0001234','[\"https://i.postimg.cc/rFtcKhFP/al-ameen-auditorium.png\"]',12.9716,75.5986,'Al-Ameen-Auditorium',50000.00,'Kerala','ACTIVE','2025-06-02 12:52:46.608995','alameen@upi','https://www.google.com','680604'),(4,'67329510740','Current','ollur church road','Ollur','Thrissur','985-652-5425',NULL,'Elclassico turf ollur','elclassico@gmail.com','SBIN0001234','[\"https://i.postimg.cc/W1LVrMdb/turf.jpg\"]',NULL,NULL,'Elclassico',800.00,'Kerala','ACTIVE','2025-06-02 12:53:29.094910','elclassico@upi','https://www.google.com','680304'),(5,'12365478965','Current','Kunnamkulam','kunnamkulam','Thrissur','9856475236','2025-06-04 10:49:23.000786','The finest wedding auditorium in kunnamkulam.','lotuspalace@gmail.com','SBIN0001234','[\"https://i.postimg.cc/3Jp0DVT4/lotus-palace.jpg\"]',103912.8,760432.1,'Lotus Palace',100000.00,'Kerala','ACTIVE','2025-06-04 10:50:40.989131','lotus@upi','https://www.justdial.com/Thrissur/Lotus-Palace-Kunnamkulam/9999PX487-X487-140505141112-K3V8_BZDET','680517');
/*!40000 ALTER TABLE `client_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-04 18:48:35
