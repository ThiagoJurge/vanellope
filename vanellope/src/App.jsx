import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Card,
  Spin,
  Typography,
  Alert,
  Image,
  Steps,
  Button,
  Divider,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;
const socket = io("https://vanellope.onrender.com/"); // Conecta ao backend

function App() {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("Aguardando QR Code...");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    socket.on("qr", (qr) => {
      setQrCode(qr);
      setStatus("📷 Escaneie o QR Code abaixo para conectar!");
      setCurrentStep(1); // Avança para a etapa de escaneamento
    });

    socket.on("ready", (message) => {
      setStatus(message);
      setCurrentStep(2); // Avança para a etapa de "Bot conectado"
    });

    return () => {
      socket.off("qr");
      socket.off("ready");
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        style={{
          textAlign: "center",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          width: "80%",
          maxWidth: "900px",
        }}
      >
        {/* <Title level={3}>Vanellope</Title> */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Etapas à esquerda */}
          <div style={{ flex: 1, paddingRight: 20 }}>
            <Steps
              current={currentStep}
              size="small"
              style={{ marginBottom: 20 }}
              direction="vertical"
            >
              <Step description="Gerando QR Code" icon={<SyncOutlined />} />
              <Step
                description="Escaneie o QR Code"
                icon={<QrcodeOutlined />}
              />
              <Step
                description="Bot UP"
                icon={<CheckCircleOutlined />}
              />
            </Steps>
          </div>

          <Divider type="vertical" style={{ height: "auto" }} />

          {/* QR Code à direita */}
          <div style={{ flex: 1, textAlign: "center", display: "grid" }} >
            {currentStep === 1 && qrCode ? (
              <>
                <Alert
                  message={status}
                  type="info"
                  showIcon
                  style={{ marginBottom: 15 }}
                />
                <Image src="/qrcode.png" alt="QR Code" width={250} preview={false} />

              </>
            ) : currentStep === 0 ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />}
                style={{ marginBottom: 20 }}
              />
            ) : (
              <Alert
                message={status}
                type="success"
                showIcon
                style={{ marginBottom: 15 }}
              />
            )}
            <Text style={{ fontSize: "14px", color: "#888" }}>{status}</Text>
            {currentStep === 2 && (
              <div style={{ marginTop: 20 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => window.location.reload()}
                >
                  Iniciar novamente
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default App;
