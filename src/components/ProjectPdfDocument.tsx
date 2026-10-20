import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { StoryBlock } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 82,
    paddingBottom: 58,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.35,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  header: {
    position: "absolute",
    top: 28,
    left: 54,
    right: 54,
    height: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.7,
    borderBottomColor: "#b8b8b8",
    paddingBottom: 7,
  },
  headerText: { flexGrow: 1, flexShrink: 1, paddingRight: 16 },
  eyebrow: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.1,
    color: "#555555",
    marginBottom: 2,
  },
  projectTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", lineHeight: 1.15 },
  logo: { width: 66, height: 15, objectFit: "contain" },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 54,
    right: 54,
    borderTopWidth: 0.6,
    borderTopColor: "#d4d4d4",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 7.5,
    color: "#606060",
  },
  block: { marginBottom: 17 },
  blockHeading: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 5,
  },
  blockNumber: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#555555",
    marginBottom: 2,
  },
  blockTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  columns: { flexDirection: "row", alignItems: "flex-start" },
  sceneColumn: { width: "50%", paddingRight: 12 },
  voiceColumn: {
    width: "50%",
    paddingLeft: 12,
    borderLeftWidth: 0.65,
    borderLeftColor: "#c7c7c7",
  },
  columnTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#555555",
    marginBottom: 7,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingTop: 5,
    borderTopWidth: 0.45,
    borderTopColor: "#dedede",
  },
  firstItem: { borderTopWidth: 0, paddingTop: 0 },
  checkbox: {
    width: 9,
    height: 9,
    marginTop: 2,
    marginRight: 7,
    borderWidth: 0.8,
    borderColor: "#555555",
  },
  itemContent: { flexGrow: 1, flexShrink: 1 },
  itemNumber: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    color: "#555555",
    marginBottom: 2,
  },
  relatedShots: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
    color: "#555555",
    marginBottom: 3,
  },
  description: { fontSize: 9, lineHeight: 1.35, marginBottom: 3 },
  detail: { fontSize: 7.5, lineHeight: 1.3, color: "#444444", marginTop: 1 },
  detailLabel: { fontFamily: "Helvetica-Bold", color: "#262626" },
  empty: { fontSize: 8, color: "#666666" },
});

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detail}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

export async function createProjectPdf(
  projectName: string,
  blocks: StoryBlock[],
  logoDataUrl: string,
) {
  let shotNumber = 0;
  const numberedBlocks = blocks.map((block) => ({
    ...block,
    scene: [...(block.scene ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((scene) => ({
        scene,
        number: String(++shotNumber).padStart(2, "0"),
      })),
    voice_over: [...(block.voice_over ?? [])].sort((a, b) => a.order - b.order),
  }));

  const document = (
    <Document
      title={`Guion de rodaje · ${projectName}`}
      author="Scriptshot"
      creator="Scriptshot"
      subject="Guion de rodaje"
    >
      <Page size="LETTER" style={styles.page} wrap>
        <View fixed style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>GUIÓN DE RODAJE</Text>
            <Text style={styles.projectTitle}>{projectName}</Text>
          </View>
          <Image src={logoDataUrl} style={styles.logo} />
        </View>

        {numberedBlocks.map((block, blockIndex) => (
          <View key={block.id} style={styles.block}>
            <View style={styles.blockHeading} wrap={false}>
              <Text style={styles.blockNumber} minPresenceAhead={24}>
                BLOQUE {String(blockIndex + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.blockTitle}>{block.title}</Text>
            </View>

            <View style={styles.columns}>
              <View style={styles.sceneColumn}>
                <Text style={styles.columnTitle} minPresenceAhead={18}>ESCENAS</Text>
                {block.scene.length ? block.scene.map(({ scene, number }, index) => (
                  <View key={scene.id} style={[styles.item, ...(index === 0 ? [styles.firstItem] : [])]} wrap={false}>
                    <View style={styles.checkbox} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemNumber}>TOMA {number}</Text>
                      <Text style={styles.description}>{scene.description || "Descripción pendiente"}</Text>
                      {scene.location?.name && <Detail label="Locación" value={scene.location.name} />}
                      {scene.camera && <Detail label="Plano" value={scene.camera} />}
                      {scene.angle && <Detail label="Ángulo" value={scene.angle} />}
                      {scene.movement && <Detail label="Movimiento" value={scene.movement} />}
                      {!!scene.requirements?.length && <Detail label="Necesidades" value={scene.requirements.join(", ")} />}
                      {scene.notes && <Detail label="Notas" value={scene.notes} />}
                      {scene.post_production && <Detail label="Postproducción" value={scene.post_production_notes || "Requiere postproducción"} />}
                      {scene.reference && <Detail label="Referencia" value={scene.reference} />}
                    </View>
                  </View>
                )) : <Text style={styles.empty}>Sin escenas en este bloque.</Text>}
              </View>

              <View style={styles.voiceColumn}>
                <Text style={styles.columnTitle} minPresenceAhead={18}>VOZ EN OFF</Text>
                {block.voice_over.length ? block.voice_over.map((voiceOver, voiceIndex) => {
                  const relatedShots = block.scene
                    .filter(({ scene }) => scene.voice_over_id === voiceOver.id)
                    .map(({ number }) => number);
                  return (
                    <View key={voiceOver.id} style={[styles.item, ...(voiceIndex === 0 ? [styles.firstItem] : [])]} wrap={false}>
                      <View style={styles.checkbox} />
                      <View style={styles.itemContent}>
                        <Text style={styles.itemNumber}>VOZ {String(voiceIndex + 1).padStart(2, "0")}</Text>
                        {relatedShots.length > 0 && <Text style={styles.relatedShots}>TOMAS {relatedShots.join(", ")}</Text>}
                        <Text style={styles.description}>{voiceOver.text || "Texto pendiente"}</Text>
                      </View>
                    </View>
                  );
                }) : <Text style={styles.empty}>Sin voz en off en este bloque.</Text>}
              </View>
            </View>
          </View>
        ))}

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `PÁGINA ${pageNumber} DE ${totalPages}`}
        />
      </Page>
    </Document>
  );

  return pdf(document).toBlob();
}
