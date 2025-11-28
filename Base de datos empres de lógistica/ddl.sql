--Creación de la base de datos
CREATE DATABASE ObligatorioBD1;
USE ObligatorioBD1;
SET DATEFORMAT dmy;
USE ObligatorioBD1;
GO

--Creación de las tablas de la base de datos

-- 1) TipoVehiculo
CREATE TABLE TipoVehiculo (
    codTipo CHAR(5) NOT NULL PRIMARY KEY,
    Descripcion VARCHAR(30) NOT NULL,
    CONSTRAINT CK_TipoVehiculo_CodigoFormato
        CHECK (codTipo LIKE '[A-Z][A-Z][A-Z][0-9][0-9]')
);

-- 2) Vehiculo
CREATE TABLE Vehiculo (
    idVehiculo INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(30) NOT NULL,
    Marca VARCHAR(20) NOT NULL,
    Matricula VARCHAR(20) NOT NULL UNIQUE,
    Modelo VARCHAR(20) NOT NULL,
    AnioFab INT NOT NULL,
    CapacidadKg INT NOT NULL,
    ConsumoKm DECIMAL(10,4) NOT NULL,
    codTipo CHAR(5) NOT NULL FOREIGN KEY REFERENCES TipoVehiculo(codTipo)
);

-- 3) Chofer
CREATE TABLE Chofer (
    nroFunc INT NOT NULL PRIMARY KEY,
    Nombre VARCHAR(30) NOT NULL,
    Apellido VARCHAR(30) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    CI VARCHAR(20) NOT NULL,
    nroLic VARCHAR(20) NOT NULL,
    FechaNac DATE NOT NULL
);

-- 4) Habilitacion
CREATE TABLE Habilitacion (
    idHab INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    Descripcion VARCHAR(20) NOT NULL
);

-- 5) Cliente
CREATE TABLE Cliente (
    idCliente INT NOT NULL PRIMARY KEY,
    RazonSocial VARCHAR(40) NOT NULL,
    Direccion VARCHAR(60),
    Telefono VARCHAR(20),
    Pais VARCHAR(30)
);

-- 6) Envio
CREATE TABLE Envio (
    nroEnvio INT NOT NULL PRIMARY KEY,
    fhSalida DATETIME NOT NULL,
    fhFinEstimada DATETIME,
    fhFinReal DATETIME,
    idCliente INT NOT NULL FOREIGN KEY REFERENCES Cliente(idCliente),
    idVehiculo INT NOT NULL FOREIGN KEY REFERENCES Vehiculo(idVehiculo)
);

-- 7) Paquete
CREATE TABLE Paquete (
    idPaquete INT NOT NULL PRIMARY KEY,
    Peso DECIMAL(10,2),
    Volumen DECIMAL(10,2),
    Descripcion VARCHAR(60) NOT NULL,
    Orden INT NOT NULL,
    nroEnvio INT NOT NULL FOREIGN KEY REFERENCES Envio(nroEnvio)
);

-- 8) Insumo
CREATE TABLE Insumo (
    codInsumo CHAR(5) NOT NULL PRIMARY KEY,
    Descripcion VARCHAR(20) NOT NULL,
    Stock INT NOT NULL,
    Proveedor VARCHAR(40),
    CONSTRAINT CK_Insumo_StockNoNegativo
        CHECK (Stock >= 0)
);

-- 9) SeguimientoEnvio (entidad débil)
CREATE TABLE SeguimientoEnvio (
    nroEnvio INT NOT NULL,
    nroLinea INT NOT NULL,
    Fecha DATE NOT NULL,
    Hora TIME NOT NULL,
    Descripcion VARCHAR(60) NOT NULL,
    CONSTRAINT PK_SeguimientoEnvio PRIMARY KEY (nroEnvio, nroLinea),
    CONSTRAINT FK_SeguimientoEnvio_Envio
        FOREIGN KEY (nroEnvio) REFERENCES Envio(nroEnvio)
);

-- 10) ChoferHabilitacion (relación Posee)
CREATE TABLE ChoferHabilitacion (
    nroFunc INT NOT NULL,
    idHab INT NOT NULL,
    CONSTRAINT PK_ChoferHabilitacion PRIMARY KEY (nroFunc, idHab),
    CONSTRAINT FK_ChoferHabilitacion_Chofer
        FOREIGN KEY (nroFunc) REFERENCES Chofer(nroFunc),
    CONSTRAINT FK_ChoferHabilitacion_Habilitacion
        FOREIGN KEY (idHab) REFERENCES Habilitacion(idHab)
);

-- 11) ChoferEnvio (relación Participa)
CREATE TABLE ChoferEnvio (
    nroFunc INT NOT NULL,
    nroEnvio INT NOT NULL,
    CONSTRAINT PK_ChoferEnvio PRIMARY KEY (nroFunc, nroEnvio),
    CONSTRAINT FK_ChoferEnvio_Chofer
        FOREIGN KEY (nroFunc) REFERENCES Chofer(nroFunc),
    CONSTRAINT FK_ChoferEnvio_Envio
        FOREIGN KEY (nroEnvio) REFERENCES Envio(nroEnvio)
);

-- 12) PaqueteInsumo (relación Insumo)
CREATE TABLE PaqueteInsumo (
    idPaquete INT NOT NULL,
    codInsumo CHAR(5) NOT NULL,
    CONSTRAINT PK_PaqueteInsumo PRIMARY KEY (idPaquete, codInsumo),
    CONSTRAINT FK_PaqueteInsumo_Paquete
        FOREIGN KEY (idPaquete) REFERENCES Paquete(idPaquete),
    CONSTRAINT FK_PaqueteInsumo_Insumo
        FOREIGN KEY (codInsumo) REFERENCES Insumo(codInsumo)
);

-- 13) InsumoCompatible (relación Compatible con)
CREATE TABLE InsumoCompatible (
    codInsumo CHAR(5) NOT NULL,
    codInsumoComp CHAR(5) NOT NULL,
    CONSTRAINT PK_InsumoCompatible PRIMARY KEY (codInsumo, codInsumoComp),
    CONSTRAINT FK_InsumoCompatible_Insumo
        FOREIGN KEY (codInsumo) REFERENCES Insumo(codInsumo),
    CONSTRAINT FK_InsumoCompatible_InsumoComp
        FOREIGN KEY (codInsumoComp) REFERENCES Insumo(codInsumo)
);
USE ObligatorioBD1;
GO

--------------------------------------------------
-- 1) TipoVehiculo
--------------------------------------------------
INSERT INTO TipoVehiculo (codTipo, Descripcion) VALUES
('CAM01', 'Camión'),
('FUR02', 'Furgón refrigerado'),
('TRI03', 'Tráiler');

--------------------------------------------------
-- 2) Vehiculo
--------------------------------------------------
INSERT INTO Vehiculo (Descripcion, Marca, Matricula, Modelo, AnioFab, CapacidadKg, ConsumoKm, codTipo)
VALUES
('Camión grande',  'Volvo',    'ABC1234', 'FH',       2018, 20000, 0.3500, 'CAM01'),
('Furgón frío',    'Mercedes', 'DEF5678', 'Sprinter', 2020,  3000, 0.1500, 'FUR02'),
('Tráiler pesado', 'Scania',   'GHI9999', 'R500',     2019, 30000, 0.4000, 'TRI03');

--------------------------------------------------
-- 3) Chofer
--------------------------------------------------
INSERT INTO Chofer (nroFunc, Nombre, Apellido, Telefono, CI, nroLic, FechaNac) VALUES
(1, 'Juan', 'Pérez',     '099111111', '4.111.111-1', 'L12345', '1980-05-10'),
(2, 'Ana',  'Gómez',     '099222222', '5.222.222-2', 'L54321', '1985-08-20'),
(3, 'Luis', 'Rodríguez', '099333333', '3.333.333-3', 'L88888', '1990-03-15'); -- sin envíos

--------------------------------------------------
-- 4) Habilitacion
--------------------------------------------------
INSERT INTO Habilitacion (Descripcion) VALUES
('Carga peligrosa'),
('Refrigerado'),
('Sobredimensionada');

--------------------------------------------------
-- 5) Cliente
--------------------------------------------------
INSERT INTO Cliente (idCliente, RazonSocial, Direccion, Telefono, Pais) VALUES
(100, 'TechWorld SA',   'Av Italia 1234',    '24886655', 'Uruguay'),
(101, 'FoodMarket SRL', 'Bvar Artigas 3000', '24995544', 'Argentina'),
(102, 'SinEnvios SA',   'Colonia 2211',      '24112233', 'Brasil'); -- cliente sin envíos

--------------------------------------------------
-- 6) Envio
--   (nroEnvio, fhSalida, fhFinEstimada, fhFinReal, idCliente, idVehiculo)
--------------------------------------------------
INSERT INTO Envio (nroEnvio, fhSalida, fhFinEstimada, fhFinReal, idCliente, idVehiculo)
VALUES
(500, '2025-01-10T08:00:00', '2025-01-11T18:00:00', '2025-01-11T17:40:00', 100, 1),
(501, '2025-02-01T09:00:00', '2025-02-02T20:00:00', '2025-02-02T19:50:00', 101, 2),
(502, '2025-02-15T07:30:00', '2025-02-15T22:00:00', '2025-02-15T21:30:00', 100, 1);

--------------------------------------------------
-- 7) ChoferHabilitacion (relación Posee)
--------------------------------------------------
INSERT INTO ChoferHabilitacion (nroFunc, idHab) VALUES
(1, 1),  -- Juan - Carga peligrosa
(1, 3),  -- Juan - Sobredimensionada
(2, 2);  -- Ana  - Refrigerado

--------------------------------------------------
-- 8) ChoferEnvio (relación Participa)
--------------------------------------------------
INSERT INTO ChoferEnvio (nroFunc, nroEnvio) VALUES
(1, 500),
(2, 500),
(2, 501),
(1, 502);

--------------------------------------------------
-- 9) Paquete
--------------------------------------------------
INSERT INTO Paquete (idPaquete, Peso, Volumen, Descripcion, Orden, nroEnvio)
VALUES
(900, 10.00,  5.00,  'Electrónicos', 1, 500),
(901,  7.00,  3.00,  'Ropa',         2, 500),
(902, 30.00, 10.00,  'Carne fría',   1, 501),
(903, 50.00, 20.00,  'Maquinaria',   1, 502);

--------------------------------------------------
-- 10) Insumo
--------------------------------------------------
INSERT INTO Insumo (codInsumo, Descripcion, Stock, Proveedor) VALUES
('PALET', 'Pallet estándar', 100, 'Maderas Sur'),
('PALEA', 'Pallet altern',    80, 'Maderas Sur'),
('PRECA', 'Precinto alta',   200, 'SegurPack'),
('PRECB', 'Precinto est',    300, 'SegurPack');

--------------------------------------------------
-- 11) PaqueteInsumo (relación Insumo)
--------------------------------------------------
INSERT INTO PaqueteInsumo (idPaquete, codInsumo) VALUES
(900, 'PALET'),
(901, 'PALEA'),
(902, 'PRECA'),
(903, 'PRECB'),
(903, 'PALET'); -- maquinaria con pallet también

--------------------------------------------------
-- 12) InsumoCompatible
--------------------------------------------------
INSERT INTO InsumoCompatible (codInsumo, codInsumoComp) VALUES
('PALET', 'PALEA'),
('PALEA', 'PALET'),
('PRECA', 'PRECB'),
('PRECB', 'PRECA');

--------------------------------------------------
-- 13) SeguimientoEnvio
--------------------------------------------------
INSERT INTO SeguimientoEnvio (nroEnvio, nroLinea, Fecha, Hora, Descripcion) VALUES
(500, 1, '2025-01-10', '08:00:00', 'Salida de depósito'),
(500, 2, '2025-01-10', '16:00:00', 'Arribo a frontera'),
(501, 1, '2025-02-01', '09:10:00', 'Salida de depósito'),
(502, 1, '2025-02-15', '07:35:00', 'Salida de depósito');

--5.1
SELECT 
    C.idCliente,
    COUNT(E.nroEnvio) AS CantidadEnvios
FROM Cliente C
LEFT JOIN Envio E ON C.idCliente = E.idCliente
GROUP BY C.idCliente;

--5.2
SELECT 
    C.idCliente,
    COUNT(E.nroEnvio) AS CantidadEnvios
FROM Cliente C
LEFT JOIN Envio E ON C.idCliente = E.idCliente
GROUP BY C.idCliente;
--5.3
SELECT 
    V.idVehiculo,
    V.Marca,
    V.Modelo,
    AVG(P.Peso) AS PesoPromedio
FROM Vehiculo V
JOIN Envio E ON V.idVehiculo = E.idVehiculo
JOIN Paquete P ON E.nroEnvio = P.nroEnvio
GROUP BY V.idVehiculo, V.Marca, V.Modelo;
--5.4
SELECT 
    C.nroFunc,
    C.Nombre,
    C.Apellido
FROM Chofer C
LEFT JOIN ChoferEnvio CE ON C.nroFunc = CE.nroFunc
WHERE CE.nroEnvio IS NULL;
--5.5
SELECT TOP 1
    V.idVehiculo,
    V.Marca,
    V.Modelo,
    COUNT(E.nroEnvio) AS CantidadEnvios
FROM Vehiculo V
JOIN Envio E ON V.idVehiculo = E.idVehiculo
GROUP BY V.idVehiculo, V.Marca, V.Modelo
ORDER BY CantidadEnvios DESC;
--5.6
SELECT 
    I.codInsumo,
    I.Descripcion AS Insumo,
    IC.codInsumoComp AS CodCompatible,
    I2.Descripcion AS DescripcionCompatible
FROM Insumo I
LEFT JOIN InsumoCompatible IC ON I.codInsumo = IC.codInsumo
LEFT JOIN Insumo I2 ON IC.codInsumoComp = I2.codInsumo
ORDER BY I.codInsumo;
--5.7

--5.7  use if porq la culumna se creo antes stockdisponible, el if proteje de volver a ejecutarlo sin problema
IF COL_LENGTH('dbo.Insumo', 'StockDisponible') IS NULL
BEGIN
    ALTER TABLE dbo.Insumo
    ADD StockDisponible INT NOT NULL DEFAULT 100;
END;
GO

UPDATE dbo.Insumo
SET StockDisponible = 100;
GO
SELECT 
    codInsumo,
    Descripcion,
    Stock,
    StockDisponible
FROM dbo.Insumo;